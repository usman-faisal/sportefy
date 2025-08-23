import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchRepository } from './match.repository';
import { UpdateMatchDto } from './dto/update-match.dto';
import {
  Profile,
  profiles,
  slots,
  users,
  venueSports,
} from '@sportefy/db-types';
import { and, eq, gte, inArray, lte, or } from 'drizzle-orm';
import { matches, matchPlayers } from '@sportefy/db-types';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { MatchPlayerRepository } from 'src/match-player/match-player.repository';
import { MatchType, PaymentSplitType, SlotEventType } from 'src/common/types';
import { ProfileRepository } from 'src/profile/profile.repository';
import { FilterMatchesDto } from './dto/filter-match.dto';
import { bookings, sports, venues } from '@sportefy/db-types';
import { CreditService } from 'src/credit/credit.service';
import * as matchValidator from './utils/match.validation';
import {
  assertBookingStatusIs,
  assertUserDoesntOwnTheBooking,
  assertUserOwnsTheBooking,
} from 'src/booking/utils/booking.validation';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';
import { GetMatchesDto } from './dto/get-matches.dto';
import { MatchCodeGenerator } from './utils/match-code.generator';
import { MatchJoinRequestService } from 'src/match-join-request/match-join-request.service';

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly creditService: CreditService,
    private readonly matchPlayerRepository: MatchPlayerRepository,
    private readonly matchJoinRequestService: MatchJoinRequestService,
    private readonly profileRepository: ProfileRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async getMatchDetails(user: Profile, matchId: string) {
    const fullMatch = await this.matchRepository.getFullMatchDetails(matchId);

    if (!fullMatch || !fullMatch.booking || !fullMatch.booking.slot) {
      throw new NotFoundException(
        'Match not found or is missing booking data.',
      );
    }

    matchValidator.validateUserCanViewPrivateMatch(
      fullMatch,
      fullMatch.matchPlayers,
      user,
    );

    return ResponseBuilder.success(fullMatch, 'Found match');
  }

  async getUserMatches(user: Profile, getMatchesDto: GetMatchesDto) {
    const { limit, offset, page } = getMatchesDto;
    const total = await this.matchPlayerRepository.count(
      eq(matchPlayers.userId, user.id),
    );
    const userMatches = await this.matchPlayerRepository.getMatchesByPlayer(
      user.id,
      { match: true },
      limit,
      offset,
    );

    if (!userMatches || userMatches.length === 0) {
      throw new NotFoundException('No userMatches found for this user');
    }
    const paginationLimit = limit || 10;
    const paginationPage = page || 1;

    const totalPages = Math.ceil(total / paginationLimit);
    const hasNext = paginationPage < totalPages;
    const hasPrev = paginationPage > 1;

    return ResponseBuilder.paginated(userMatches, {
      page: paginationPage,
      limit: paginationLimit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    });
  }

  async updateMatch(
    matchId: string,
    user: Profile,
    updateMatchDto: UpdateMatchDto,
  ) {
    // Validate the match exists
    const existingMatch = await this.matchRepository.getMatch(
      eq(matches.id, matchId),
      { booking: true },
    );

    if (!existingMatch) {
      throw new NotFoundException('Match not found');
    }

    matchValidator.assertUserCanUpdateMatch(existingMatch.booking, user);
    matchValidator.assertBookingIsNotCancelled(existingMatch.booking);

    const updatedMatch = await this.unitOfWork.do(async (tx) => {
      const updatedMatch = await this.matchRepository.updateMatchById(
        existingMatch.id,
        {
          ...updateMatchDto,
        },
      );

      return updatedMatch;
    });

    return ResponseBuilder.updated(updatedMatch, 'Match updated successfully');
  }

  async joinMatch(
    matchId: string,
    user: Profile,
    team?: 'A' | 'B',
    message?: string,
  ) {
    // For public matches, create a join request instead of directly joining
    const match = await this.matchRepository.getMatchById(matchId);

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.matchType === MatchType.PUBLIC) {
      // Create a join request for public matches
      return this.matchJoinRequestService.createJoinRequest(matchId, user, {
        preferredTeam: team,
        message,
      });
    } else {
      throw new ForbiddenException(
        'Cannot directly join private match. Use match code.',
      );
    }
  }

  /**
   * Join a private match using a match code
   */
  async joinMatchUsingCode(user: Profile, matchCode: string) {
    // Clean and validate the match code
    const cleanCode = MatchCodeGenerator.cleanCode(matchCode);

    if (!MatchCodeGenerator.isValidMatchCode(cleanCode)) {
      throw new BadRequestException('Invalid match code format');
    }

    const match = await this.matchRepository.getMatch(
      eq(matches.matchCode, cleanCode),
      { booking: true, matchPlayers: true },
    );

    if (!match || !match.booking) {
      throw new NotFoundException('Match not found with this code.');
    }

    if (match.status !== 'open' || match.booking.status === 'cancelled') {
      throw new ForbiddenException('Match is not open');
    }

    matchValidator.validateUserCanJoinByInvite(
      match,
      match.booking,
      match.matchPlayers,
      user,
    );

    const joinedMatch = await this.unitOfWork.do(async (tx) => {
      const newMatchPlayer = await this.matchPlayerRepository.createMatchPlayer(
        {
          matchId: match.id,
          userId: user.id,
          team: matchValidator.findTeamToJoin(match.matchPlayers),
        },
        tx,
      );

      if (
        matchValidator.isMatchNowFull(match.matchPlayers, match.playerLimit)
      ) {
        await this.matchRepository.updateMatchById(
          match.id,
          {
            status: 'full',
          },
          tx,
        );
      }
      const creditsToCharge = this.creditService.calculatePerPlayerCharge(
        match.matchType as MatchType,
        match.paymentSplitType as PaymentSplitType,
        match.booking.totalCredits,
        match.playerLimit,
        false,
      );

      if (!user.credits || user.credits < creditsToCharge) {
        throw new BadRequestException('Not enough credits to join this match.');
      }

      if (creditsToCharge > 0) {
        await this.profileRepository.updateProfileCreditsById(
          user.id,
          -creditsToCharge,
          tx,
        );
      }

      return newMatchPlayer;
    });

    return ResponseBuilder.created(
      joinedMatch,
      'Successfully joined the match',
    );
  }

  /**
   * Generate a new match code for a match (useful if the current one needs to be changed)
   */
  async regenerateMatchCode(user: Profile, matchId: string) {
    const match = await this.matchRepository.getMatch(eq(matches.id, matchId), {
      booking: true,
    });

    if (!match || !match.booking) {
      throw new NotFoundException('Match not found');
    }

    // Only the match creator can regenerate the code
    assertUserOwnsTheBooking(user, match.booking);

    let newCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    // Generate a unique code (retry if collision occurs)
    do {
      newCode = MatchCodeGenerator.generateMatchCode();
      attempts++;

      // Check if code already exists
      const existingMatch = await this.matchRepository.getMatch(
        eq(matches.matchCode, newCode),
      );

      if (!existingMatch) {
        break; // Code is unique
      }

      if (attempts >= maxAttempts) {
        throw new BadRequestException(
          'Unable to generate unique match code. Please try again.',
        );
      }
    } while (attempts < maxAttempts);

    const updatedMatch = await this.matchRepository.updateMatchById(matchId, {
      matchCode: newCode,
    });

    return ResponseBuilder.updated(
      {
        ...updatedMatch,
        formattedMatchCode: MatchCodeGenerator.formatForDisplay(newCode),
      },
      'Match code regenerated successfully',
    );
  }

  async leaveMatch(user: Profile, matchId: string) {
    const match = await this.matchRepository.getMatchById(matchId, {
      booking: true,
    });

    if (!match) {
      throw new NotFoundException('Match does not exist');
    }

    assertUserDoesntOwnTheBooking(user, match.booking);
    assertBookingStatusIs(match.booking, 'pending');

    await this.unitOfWork.do(async (tx) => {
      const creditsToRefund = this.creditService.calculatePerPlayerCharge(
        match.matchType as MatchType,
        match.paymentSplitType as PaymentSplitType,
        match.booking.totalCredits,
        match.playerLimit,
        false,
      );

      if (creditsToRefund > 0) {
        await this.profileRepository.updateProfileCreditsById(
          user.id,
          creditsToRefund,
          tx,
        );
      }

      await this.matchPlayerRepository.deleteMatchPlayer(
        and(
          eq(matchPlayers.userId, user.id),
          eq(matchPlayers.matchId, match.id),
        ),
        tx,
      );
      if (match.status === 'full') {
        await this.matchRepository.updateMatchById(
          match.id,
          {
            status: 'open',
          },
          tx,
        );
      }
    });

    return ResponseBuilder.deleted('Match player removed successfully');
  }

  async kickPlayer(
    matchId: string,
    userIdToKick: string,
    requestingUser: Profile,
  ) {
    const match = await this.matchRepository.getMatchById(matchId, {
      booking: true,
      matchPlayers: true,
    });

    if (!match) {
      throw new NotFoundException('Match does not exist');
    }

    assertUserOwnsTheBooking(requestingUser, match.booking);
    matchValidator.assertUserIsInMatchPlayers(match.matchPlayers, userIdToKick);

    await this.unitOfWork.do(async (tx) => {
      const creditsToRefund = this.creditService.calculatePerPlayerCharge(
        match.matchType as MatchType,
        match.paymentSplitType as PaymentSplitType,
        match.booking.totalCredits,
        match.playerLimit,
        false,
      );

      if (creditsToRefund > 0) {
        await this.profileRepository.updateProfileCreditsById(
          userIdToKick,
          creditsToRefund,
          tx,
        );
      }

      await this.matchPlayerRepository.deleteMatchPlayer(
        and(
          eq(matchPlayers.userId, userIdToKick),
          eq(matchPlayers.matchId, match.id),
        ),
        tx,
      );
      if (match.status === 'full') {
        await this.matchRepository.updateMatchById(
          match.id,
          {
            status: 'open',
          },
          tx,
        );
      }
    });

    return ResponseBuilder.success(null, 'User kicked successfully');
  }

  async getFilteredMatches(filters: FilterMatchesDto) {
    const { sports: sportNames, gender, age, skillLevel } = filters;
    const conditions = [
      eq(matches.status, 'open'),
      eq(matches.matchType, MatchType.PUBLIC),
    ];

    if (gender) {
      conditions.push(eq(matches.genderPreference, gender));
    }

    if (age) {
      conditions.push(lte(matches.minAge, age));
      conditions.push(gte(matches.maxAge, age));
    }

    if (skillLevel) {
      conditions.push(eq(matches.skillLevel, skillLevel));
    }
    if (sportNames && sportNames.length > 0) {
      conditions.push(inArray(sports.name, sportNames));
    }

    const query = this.matchRepository.db
      .select({
        match: matches,
        booking: bookings,
        venue: venues,
        sport: sports,
        slot: slots,
        matchPlayers: {
          ...matchPlayers,
          user: profiles,
        },
      })
      .from(matches)
      .leftJoin(bookings, eq(matches.bookingId, bookings.id))
      .leftJoin(venues, eq(bookings.venueId, venues.id))
      .leftJoin(sports, eq(matches.sportId, sports.id))
      .leftJoin(
        slots,
        and(
          eq(slots.eventId, bookings.id),
          eq(slots.eventType, SlotEventType.BOOKING),
        ),
      )
      .leftJoin(matchPlayers, eq(matches.id, matchPlayers.matchId))
      .leftJoin(profiles, eq(matchPlayers.userId, profiles.id))
      .where(and(...conditions));

    const filteredMatches = await query;

    if (!filteredMatches || filteredMatches.length === 0) {
      throw new NotFoundException('No matches found for the given criteria.');
    }

    return ResponseBuilder.success(
      filteredMatches,
      'Matches retrieved successfully',
    );
  }
}
