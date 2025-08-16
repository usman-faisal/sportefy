import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CheckInDto } from './dto/check-in.dto';
import {
  BookingStatus,
  MatchStatus,
  MatchType,
  SportType,
} from 'src/common/types';
import {
  Booking,
  checkIns,
  Profile,
  profiles,
  Slot,
  venueSports,
} from '@sportefy/db-types';
import { JwtService } from '@nestjs/jwt';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { and, eq, gte, isNull } from 'drizzle-orm';
import { BookingRepository } from 'src/booking/booking.repository';
import { MatchRepository } from 'src/match/match.repository';
import { MatchPlayerRepository } from 'src/match-player/match-player.repository';
import { bookings, matches, matchPlayers } from '@sportefy/db-types';
import {
  assertBookingStatusIs,
  assertBookingStatusIsNot,
} from 'src/booking/utils/booking.validation';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';
import { CheckInRepository } from './check-in.repository';
import { WalkInCheckInDto } from './dto/walk-in-check-in.dto';
import { ProfileRepository } from 'src/profile/profile.repository';
import { VenueSportRepository } from 'src/venue-sport/venue-sport.repository';
import { WalkInCheckOutDto } from './dto/walk-in-check-out.dto';

@Injectable()
export class CheckInService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly bookingRepository: BookingRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchPlayerRepository: MatchPlayerRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly checkInRepository: CheckInRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly venueSportRepository: VenueSportRepository,
  ) {}

  private async validateCheckInAttempt(booking: Booking, slot: Slot) {
    assertBookingStatusIs(
      booking,
      BookingStatus.CONFIRMED,
      'Booking must be confirmed to check-in.',
    );
    assertBookingStatusIsNot(
      booking,
      BookingStatus.COMPLETED,
      'This booking has already been completed.',
    );
    assertBookingStatusIsNot(
      booking,
      BookingStatus.CANCELLED,
      'This booking has been cancelled.',
    );

    const now = new Date();
    const startTime = new Date(slot.startTime);
    const validFrom = new Date(startTime.getTime() - 15 * 60000);
    const validUntil = new Date(startTime.getTime() + 15 * 60000);
    if (now < validFrom || now > slot.endTime) {
      throw new ForbiddenException(
        `Check-in is only available from ${validFrom.toLocaleTimeString()} to ${validUntil.toLocaleTimeString()}.`,
      );
    }
  }

  async checkIn(user: Profile, checkInDto: CheckInDto) {
    const { qrCode } = checkInDto;
    let payload: { bookingId: string };

    try {
      payload = await this.jwtService.verifyAsync(qrCode);
    } catch (error) {
      throw new BadRequestException('Invalid or expired QR Code.');
    }

    const [bookingDetails] =
      await this.bookingRepository.getBookingsWithJoinedSlot(
        eq(bookings.id, payload.bookingId),
      );

    if (!bookingDetails) {
      throw new NotFoundException('Booking not found from this QR code.');
    }

    const { booking, slot, match } = bookingDetails;

    if (!slot || !match) {
      throw new NotFoundException(
        'Booking does not have associated slot or match information.',
      );
    }

    this.validateCheckInAttempt(booking, slot);

    const playerInMatch = await this.matchPlayerRepository.getMatchPlayer(
      and(eq(matchPlayers.matchId, match.id), eq(matchPlayers.userId, user.id)),
    );

    if (!playerInMatch) {
      throw new ForbiddenException('You are not a player in this match.');
    }

    const result = await this.unitOfWork.do(async (tx) => {
      const existingCheckIn = await this.checkInRepository.getCheckIn(
        and(eq(checkIns.userId, user.id), eq(checkIns.bookingId, booking.id)),
        {},
        tx,
      );

      if (existingCheckIn) {
        return { alreadyCheckedIn: true };
      }

      await this.checkInRepository.createCheckIn(
        {
          userId: user.id,
          venueId: booking.venueId,
          bookingId: booking.id,
          checkInTime: new Date(),
        },
        tx,
      );

      const checkedInPlayers = await this.checkInRepository.count(
        eq(checkIns.bookingId, booking.id),
        tx,
      );

      const isBookingComplete =
        match.matchType === MatchType.PRIVATE ||
        checkedInPlayers >= match.playerLimit;

      if (isBookingComplete) {
        await Promise.all([
          this.bookingRepository.updateBookingById(
            booking.id,
            { status: BookingStatus.COMPLETED },
            tx,
          ),
          this.matchRepository.updateMatch(
            eq(matches.id, match.id),
            { status: MatchStatus.COMPLETED },
            tx,
          ),
        ]);
      }

      return {
        alreadyCheckedIn: false,
        isBookingComplete,
        checkedInCount: checkedInPlayers,
        totalPlayers: match.playerLimit,
      };
    });

    if (result.alreadyCheckedIn) {
      return ResponseBuilder.success(null, 'You have already checked in.');
    }

    if (result.isBookingComplete) {
      return ResponseBuilder.success(
        { ...result },
        'Final player checked in. Booking is now completed.',
      );
    }

    return ResponseBuilder.success(
      { ...result },
      `Player checked in successfully. ${result.checkedInCount} of ${result.totalPlayers} players have checked in.`,
    );
  }

  async walkInCheckIn(user: Profile, walkInDto: WalkInCheckInDto) {
    const { venueId, sportId } = walkInDto;

    const venueSport = await this.venueSportRepository.getVenueSport(
      and(eq(venueSports.venueId, venueId), eq(venueSports.sportId, sportId)),
      { sport: true },
    );

    if (!venueSport || !venueSport.sport) {
      throw new NotFoundException('Venue or associated sport not found.');
    }

    if (venueSport.sport.sportType !== SportType.SINGLE) {
      throw new BadRequestException(
        'This venue requires a booking to check-in.',
      );
    }

    if (!user.checkIns || user.checkIns <= 0) {
      throw new ForbiddenException('You have no check-in credits left.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysCheckIn = await this.checkInRepository.getCheckIn(
      and(
        eq(checkIns.userId, user.id),
        eq(checkIns.venueId, venueId),
        gte(checkIns.checkInTime, today),
      ),
    );

    if (todaysCheckIn) {
      throw new BadRequestException(
        'You have already checked into this venue today. Only one walk-in is allowed per day.',
      );
    }

    await this.unitOfWork.do(async (tx) => {
      await this.profileRepository.updateProfileCheckIns(
        eq(profiles.id, user.id),
        -1,
        tx,
      );

      await this.checkInRepository.createCheckIn(
        {
          userId: user.id,
          venueId: venueId,
          checkInTime: new Date(),
        },
        tx,
      );
    });

    return ResponseBuilder.success(
      null,
      'Check-in successful. Enjoy your session!',
    );
  }

  async walkInCheckOut(user: Profile, walkInCheckOutDto: WalkInCheckOutDto) {
    const { venueId } = walkInCheckOutDto;

    const activeCheckIn = await this.checkInRepository.getCheckIn(
      and(
        eq(checkIns.userId, user.id),
        eq(checkIns.venueId, venueId),
        isNull(checkIns.checkOutTime),
      ),
    );

    if (!activeCheckIn) {
      throw new NotFoundException('No active check-in found for this venue.');
    }

    await this.checkInRepository.updateCheckIn(
      eq(checkIns.id, activeCheckIn.id),
      {
        checkOutTime: new Date(),
      },
    );

    return ResponseBuilder.success(null, 'Check-out successful. Thank you!');
  }

  async getUserCheckIns(userId: string) {
    const userCheckIns = await this.checkInRepository.getManyCheckIns(
      eq(checkIns.userId, userId),
      {
        user: true,
        venue: true,
        booking: true,
      },
    );

    return ResponseBuilder.success(userCheckIns);
  }

  async getCheckInCount(venueId: string) {
    const count = await this.checkInRepository.getActiveCheckInCountForVenue(
      venueId,
    );

    return ResponseBuilder.success({
      venueId,
      count,
    });
  }

  async getCheckInsByVenue(venueId: string) {
    const checkInsList = await this.checkInRepository.getCheckInsByVenue(
      venueId,
    );

    return ResponseBuilder.success(checkInsList);
  }
}
