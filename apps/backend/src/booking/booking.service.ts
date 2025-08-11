import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import {
  Booking,
  Match,
  Profile,
  users,
  venueSports,
} from '@sportefy/db-types';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  BookingStatus,
  MatchType,
  PaymentSplitType,
  SlotEventType,
  SportType,
  PaginatedResult,
} from 'src/common/types';
import { ProfileRepository } from 'src/profile/profile.repository';
import { and, eq, gt, gte, exists, ConsoleLogWriter, inArray } from 'drizzle-orm';
import {
  bookings,
  matches,
  matchPlayers,
  slots,
  venues,
} from '@sportefy/db-types';
import { SlotService } from 'src/slot/slot.service';
import { SlotRepository } from 'src/slot/slot.repository';
import { MatchRepository } from 'src/match/match.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { MatchPlayerRepository } from 'src/match-player/match-player.repository';
import { BookingSchedulerService } from './booking-scheduler.service';
import { BookingCreatedEvent } from './events/booking-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreditService } from 'src/credit/credit.service';
import * as bookingValidator from './utils/booking.validation';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtService } from '@nestjs/jwt';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';
import { GetBookingsDto } from './dto/get-bookings.dto';
import { VenueSportRepository } from 'src/venue-sport/venue-sport.repository';
import { SearchBookingsQuery } from './dto/search-bookings.query';
import { SQL } from 'drizzle-orm';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly slotService: SlotService,
    private readonly slotRepository: SlotRepository,
    private readonly matchRepository: MatchRepository,
    private readonly matchPlayerRepository: MatchPlayerRepository,
    private readonly bookingSchedulerService: BookingSchedulerService,
    private readonly eventEmitter: EventEmitter2,
    private readonly creditService: CreditService,
    private readonly jwtService: JwtService,
    private readonly unitOfWork: UnitOfWork,
    private readonly venueSportRepository: VenueSportRepository,
  ) {}

  async getBooking(user: Profile, bookingId: string) {
    const [booking] = await this.bookingRepository.getBookingsWithJoinedSlot(
      eq(bookings.id, bookingId),
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    bookingValidator.assertUserOwnsTheBooking(user, booking as unknown as Booking)

    return ResponseBuilder.success(booking);
  }

  async getUserBookings(user: Profile, getBookingsDto: GetBookingsDto) {
    const { limit, offset, page, status } = getBookingsDto;

    const startOfDay = new Date();

    startOfDay.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30));

    const createdAtCondition =
      status === 'upcoming'
        ? gte(bookings.createdAt, startOfDay)
        : gte(bookings.createdAt, thirtyDaysAgo);

    const bookingIsBookedByUser = eq(users.id, user.id);
    const whereConditions = and(createdAtCondition, bookingIsBookedByUser);
    const total = await this.bookingRepository.count(whereConditions);
    const result = await this.bookingRepository.getManyBookings(
      whereConditions,
      undefined,
      limit,
      offset,
      (bookings, { desc }) => desc(bookings.createdAt),
    );
    const paginationLimit = limit || 10;
    const paginationPage = page || 1;

    const totalPages = Math.ceil(total / paginationLimit);
    const hasNext = paginationPage < totalPages;
    const hasPrev = paginationPage > 1;

    return ResponseBuilder.paginated(result, {
      page: paginationPage,
      limit: paginationLimit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    });
  }

  async createBooking(user: Profile, createBookingDto: CreateBookingDto) {
    const { match, slot, venueId, sportId } = createBookingDto;

    const venueSportCheck = await this.venueSportRepository.getVenueSport(
      and(eq(venueSports.venueId, venueId), eq(venueSports.sportId, sportId)),
      {
        venue: true,
        sport: true,
      },
    );

    if (!venueSportCheck) {
      throw new NotFoundException('venue not found');
    }

    const { venue, sport } = venueSportCheck;

    bookingValidator.assertPlayerLimitIsLessThanCapacity(
      venue,
      createBookingDto.match.playerLimit,
    );

    if (sport.sportType === SportType.SINGLE) {
    }

    // check if the slot is available
    await this.slotService.validateTimeSlot(
      venueId,
      slot.startTime,
      slot.endTime,
    );

    // Calculate credits to charge using the extracted function
    const creditsToCharge = this.creditService.calculatePerPlayerCharge(
      match.matchType,
      match.paymentSplitType,
      venue.basePrice,
      match.playerLimit,
      true,
    );

    bookingValidator.assertUserHasEnoughCredits(user, creditsToCharge);

    // create booking
    const result = await this.unitOfWork.do(async (tx) => {
      const newBooking = await this.bookingRepository.createBooking(
        {
          bookedBy: user.id,
          totalCredits: venue.basePrice,
          venueId: venueId,
        },
        tx,
      );
      const [_, newMatch] = await Promise.all([
        // create slot
        this.slotRepository.createSlot(
          {
            startTime: slot.startTime,
            endTime: slot.endTime,
            eventId: newBooking.id,
            eventType: SlotEventType.BOOKING,
            venueId,
          },
          tx,
        ),

        // create match
        this.matchRepository.createMatch(
          {
            bookingId: newBooking.id,
            createdBy: user.id,
            playerLimit: match.playerLimit,
            genderPreference: match.genderPreference ? 'any' : undefined,
            organizationPreference: match.organizationPreference ?? undefined,
            minAge: match.minAge,
            maxAge: match.maxAge,
            title: match.title,
            skillLevel: match.skillLevel,
            matchType: match.matchType,
            paymentSplitType: match.paymentSplitType,
            status: 'open',
            sportId: createBookingDto.sportId,
          },
          tx,
        ),
      ]);

      await this.matchPlayerRepository.createMatchPlayer(
        {
          userId: user.id,
          matchId: newMatch.id,
          team: 'A',
        },
        tx,
      );

      // finally charge credits
      await this.profileRepository.updateProfileCreditsById(
        user.id,
        -creditsToCharge,
        tx,
      );
      // TODO:
      // await this.transactionRepository.createTransaction(
      //   {
      //     userId: user.id,
      //     bookingId: newBooking.id,
      //     type: TransactionType.BOOKING_FEE,
      //     amount: -creditsToCharge,
      //   },
      //   tx,
      // );

      if (match.matchType === MatchType.PUBLIC) {
        this.eventEmitter.emit(
          'booking.created',
          new BookingCreatedEvent(
            newBooking.id,
            newMatch.id,
            venueId,
            newBooking.createdAt || new Date(),
          ),
        );
      }

      return [newBooking, newMatch];
    });

    return ResponseBuilder.created(result, 'Booking created successfully');
  }

  async updateBooking(
    user: Profile,
    bookingId: string,
    updateBookingDto: UpdateBookingDto,
  ) {
    const booking = await this.bookingRepository.getBookingById(bookingId, {
      match: true,
    });
    if (!booking) {
      throw new NotFoundException('booking not found');
    }
    const { status } = updateBookingDto;

    if (status === BookingStatus.CANCELLED) {
      return await this.handleCancelBooking(user, booking);
    }

    if (status === BookingStatus.CONFIRMED) {
      return await this.handleConfirmBooking(user, booking);
    }
    throw new BadRequestException('Invalid status');
  }

  async handleConfirmBooking(
    user: Profile,
    booking: Booking & { match: Match },
  ) {
    bookingValidator.validateConfirmableBooking(booking, user);

    const result = await this.unitOfWork.do(async (tx) => {
      return await this.bookingRepository.updateBookingById(
        booking.id,
        {
          status: BookingStatus.CONFIRMED,
        },
        tx,
      );
    });

    return result;
  }
  async handleCancelBooking(
    user: Profile,
    booking: Booking & { match: Match },
  ) {
    bookingValidator.validateCancellableBooking(booking, user);

    await this.unitOfWork.do(async (tx) => {
      if (
        booking.match.paymentSplitType === PaymentSplitType.CREATOR_PAYS_ALL
      ) {
        await this.profileRepository.updateProfileCreditsById(
          user.id,
          booking.totalCredits,
          tx,
        );
      } else {
        const players = await this.matchPlayerRepository.getManyMatchPlayers(
          eq(matchPlayers.matchId, booking.match.id),
          undefined,
          undefined,
          undefined,
          undefined,
          tx,
        );

        if (players.length > 0) {
          const creditsToRestorePerPlayer =
            this.creditService.calculatePerPlayerCharge(
              booking.match.matchType as MatchType,
              booking.match.paymentSplitType as PaymentSplitType,
              booking.totalCredits,
              booking.match.playerLimit,
            );

          await Promise.all(
            players.map((player) =>
              this.profileRepository.updateProfileCreditsById(
                player.userId,
                creditsToRestorePerPlayer,
                tx,
              ),
            ),
          );
        }
        await Promise.all([
          this.bookingRepository.updateBookingById(
            booking.id,
            {
              status: 'cancelled',
            },
            tx,
          ),

          this.matchRepository.updateMatch(
            eq(matches.bookingId, booking.id),
            { status: 'cancelled' },
            tx,
          ),

          this.slotRepository.deleteSlot(
            and(
              eq(slots.eventId, booking.id),
              eq(slots.eventType, SlotEventType.BOOKING),
              eq(slots.venueId, booking.venueId),
            ),
            tx,
          ),
        ]);
      }
    });

    this.bookingSchedulerService.cancelScheduledJob(booking.id);

    return ResponseBuilder.success(null, 'Booking cancelled successfully.');
  }


  async getAllBookings(searchQuery: SearchBookingsQuery): Promise<PaginatedResult<Booking>> {
    const { limit, offset, page, ...otherSearchQuery } = searchQuery;
    const whereConditions = this.buildWhereConditions(otherSearchQuery);

    const total = await this.bookingRepository.count(whereConditions);
    const data = await this.bookingRepository.getManyBookings(
      whereConditions,
      {
        venue: true,
        bookedByProfile: true,
        match: {
          with: {
            sport: true,
          },
        },
        slot: true,
      },
      limit,
      offset,
      (bookings, { desc }) => desc(bookings.createdAt),
    );

    const paginationLimit = limit || 10;
    const paginationPage = page || 1;

    const totalPages = Math.ceil(total / paginationLimit);
    const hasNext = paginationPage < totalPages;
    const hasPrev = paginationPage > 1;

    this.logger.log(
      `Fetched ${data.length} bookings on page ${paginationPage} with limit ${paginationLimit}`,
    );
    return ResponseBuilder.paginated(data, {
      page: paginationPage,
      limit: paginationLimit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    });
  }

  /**
   * Builds the where conditions for searching bookings based on the search query.
   * @param searchQuery The search criteria for bookings.
   * @returns SQL conditions for the query.
   */
  private buildWhereConditions(
    query: Partial<SearchBookingsQuery>,
  ): SQL<unknown> | undefined {
    const conditions: any[] = [];

    if (query.venueId) {
      conditions.push(eq(bookings.venueId, query.venueId));
    }

    if (query.status) {
      conditions.push(eq(bookings.status, query.status));
    }

    if (query.bookedBy) {
      conditions.push(eq(bookings.bookedBy, query.bookedBy));
    }

    if (query.facilityId) {
      conditions.push(
        exists(
          this.bookingRepository.db
            .select()
            .from(venues)
            .where(
              and(
                eq(venues.id, bookings.venueId),
                eq(venues.facilityId, query.facilityId),
              ),
            ),
        ),
      );
    }

    if (query.sportId) {
      conditions.push(
        exists(
          this.bookingRepository.db
            .select()
            .from(matches)
            .where(
              and(
                eq(matches.bookingId, bookings.id),
                eq(matches.sportId, query.sportId),
              ),
            ),
        ),
      );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  /**
   * Get booking statistics including total revenue, bookings count, and status breakdown.
   * @returns Booking statistics object
   */
  async getBookingStats() {
    const stats = await this.bookingRepository.getBookingStats();
    
    return ResponseBuilder.success(stats, 'Booking statistics retrieved successfully');
  }

  /**
   * Get all bookings for staff members based on their scope (facilities/venues they moderate)
   * @param searchQuery Search and filter parameters
   * @param userScopes User's scope information
   * @returns Paginated bookings result
   */
  async getStaffBookings(searchQuery: SearchBookingsQuery, userScopes: any[]): Promise<PaginatedResult<Booking>> {
    const { limit, offset, page, ...otherSearchQuery } = searchQuery;
    
    // Build where conditions including scope restrictions
    const whereConditions = this.buildStaffWhereConditions(otherSearchQuery, userScopes);

    const total = await this.bookingRepository.count(whereConditions);
    const data = await this.bookingRepository.getManyBookings(
      whereConditions,
      {
        venue: true,
        bookedByProfile: true,
        match: {
          with: {
            sport: true,
          },
        },
        slot: true,
      },
      limit,
      offset,
      (bookings, { desc }) => desc(bookings.createdAt),
    );

    const paginationLimit = limit || 10;
    const paginationPage = page || 1;

    const totalPages = Math.ceil(total / paginationLimit);
    const hasNext = paginationPage < totalPages;
    const hasPrev = paginationPage > 1;

    this.logger.log(
      `Fetched ${data.length} staff bookings on page ${paginationPage} with limit ${paginationLimit}`,
    );
    return ResponseBuilder.paginated(data, {
      page: paginationPage,
      limit: paginationLimit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    });
  }

  /**
   * Get booking statistics for staff based on their scope
   * @param userScopes User's scope information
   * @returns Booking statistics object
   */
  async getStaffBookingStats(userScopes: any[]) {
    // Build where conditions for staff scope
    const whereConditions = this.buildStaffWhereConditions({}, userScopes);
    
    const stats = await this.bookingRepository.getBookingStats(whereConditions);
    
    return ResponseBuilder.success(stats, 'Staff booking statistics retrieved successfully');
  }

  /**
   * Builds the where conditions for staff bookings based on their scope.
   * @param query The search criteria for bookings.
   * @param userScopes User's scope information
   * @returns SQL conditions for the query.
   */
  private buildStaffWhereConditions(
    query: Partial<SearchBookingsQuery>,
    userScopes: any[]
  ): SQL<unknown> | undefined {
    const conditions: any[] = [];

    // Add scope restrictions based on user's access
    const accessibleVenueIds = userScopes
      .filter(scope => scope.venueId)
      .map(scope => scope.venueId);

    const accessibleFacilityIds = userScopes
      .filter(scope => scope.facilityId)
      .map(scope => scope.facilityId);

    if (accessibleVenueIds.length > 0) {
      conditions.push(
        accessibleVenueIds.length === 1 
          ? eq(bookings.venueId, accessibleVenueIds[0])
          : inArray(bookings.venueId, accessibleVenueIds)
      );
    }

    if (accessibleFacilityIds.length > 0) {
      conditions.push(
        exists(
          this.bookingRepository.db
            .select()
            .from(venues)
            .where(
              and(
                eq(venues.id, bookings.venueId),
                inArray(venues.facilityId, accessibleFacilityIds)
              ),
            ),
        ),
      );
    }

    // Add other search conditions
    if (query.venueId) {
      conditions.push(eq(bookings.venueId, query.venueId));
    }

    if (query.status) {
      conditions.push(eq(bookings.status, query.status));
    }

    if (query.bookedBy) {
      conditions.push(eq(bookings.bookedBy, query.bookedBy));
    }

    if (query.sportId) {
      conditions.push(
        exists(
          this.bookingRepository.db
            .select()
            .from(matches)
            .where(
              and(
                eq(matches.bookingId, bookings.id),
                eq(matches.sportId, query.sportId),
              ),
            ),
        ),
      );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }
}
