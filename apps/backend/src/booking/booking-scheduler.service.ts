import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingCreatedEvent } from './events/booking-created.event';
import { MatchRepository } from 'src/match/match.repository';
import { BookingRepository } from './booking.repository';
import { MatchPlayerRepository } from 'src/match-player/match-player.repository';
import { ProfileRepository } from 'src/profile/profile.repository';
import { SlotRepository } from 'src/slot/slot.repository';
import { eq, and } from 'drizzle-orm';
import { matches, matchPlayers, slots } from '@sportefy/db-types';
import { SlotEventType, MatchType, PaymentSplitType } from 'src/common/types';
import { CreditService } from 'src/credit/credit.service';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';

@Injectable()
export class BookingSchedulerService {
  private readonly logger = new Logger(BookingSchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly matchRepository: MatchRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly matchPlayerRepository: MatchPlayerRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly slotRepository: SlotRepository,
    private readonly creditService: CreditService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  @OnEvent('booking.created')
  async handleBookingCreated(event: BookingCreatedEvent) {
    this.logger.log(
      `Scheduling auto-cancellation job for booking ${event.bookingId}`,
    );

    const jobName = `auto-cancel-booking-${event.bookingId}`;
    const runAt = new Date(event.createdAt.getTime() + 2 * 60 * 60 * 1000);
    // every 15 seconds
    // const runAt = new Date(Date.now() + 15 * 1000); // Adjusted for testing purposes

    const timeout = setTimeout(async () => {
      await this.handleBookingAutoCancel(
        event.bookingId,
        event.matchId,
        event.venueId,
      );
      this.schedulerRegistry.deleteTimeout(jobName);
    }, runAt.getTime() - Date.now());

    this.schedulerRegistry.addTimeout(jobName, timeout);
  }

  private async handleBookingAutoCancel(
    bookingId: string,
    matchId: string,
    venueId: string,
  ) {
    try {
      this.logger.log(
        `Checking if booking ${bookingId} should be auto-cancelled`,
      );

      const match = await this.matchRepository.getMatch(
        eq(matches.id, matchId),
        { matchPlayers: true, booking: true },
      );

      if (!match) {
        this.logger.warn(`Match ${matchId} not found during auto-cancel check`);
        return;
      }

      if (match.booking.status === 'cancelled') {
        this.logger.log(`Booking ${bookingId} is already cancelled`);
        return;
      }

      if (match.status === 'full') {
        this.logger.log(
          `Match ${matchId} is full, no auto-cancellation needed`,
        );
        return;
      }

      this.logger.log(
        `Auto-cancelling booking ${bookingId} due to insufficient players`,
      );

      await this.unitOfWork.do(async (tx) => {
        if (
          match.matchType === MatchType.PRIVATE &&
          match.paymentSplitType === PaymentSplitType.CREATOR_PAYS_ALL
        ) {
          await this.profileRepository.updateProfileCreditsById(
            match.booking.bookedBy,
            match.booking.totalCredits,
            tx,
          );
        } else {
          const players = await this.matchPlayerRepository.getManyMatchPlayers(
            eq(matchPlayers.matchId, matchId),
            undefined,
            undefined,
            undefined,
            undefined,

            tx,
          );

          if (players.length > 0) {
            const creditsToRestorePerPlayer =
              this.creditService.calculatePerPlayerCharge(
                match.matchType as MatchType,
                match.paymentSplitType as PaymentSplitType,
                match.booking.totalCredits,
                match.playerLimit,
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
        }

        await this.bookingRepository.updateBookingById(
          bookingId,
          {
            status: 'cancelled',
          },
          tx,
        );

        await this.slotRepository.deleteSlot(
          and(
            eq(slots.eventId, bookingId),
            eq(slots.eventType, SlotEventType.BOOKING),
            eq(slots.venueId, venueId),
          ),
          tx,
        );

        // Update match status
        await this.matchRepository.updateMatchById(
          matchId,
          {
            status: 'cancelled',
          },
          tx,
        );
      });

      this.logger.log(`Successfully auto-cancelled booking ${bookingId}`);
    } catch (error) {
      this.logger.error(
        `Error during auto-cancel for booking ${bookingId}:`,
        error,
      );
    }
  }

  cancelScheduledJob(bookingId: string) {
    const jobName = `auto-cancel-booking-${bookingId}`;
    try {
      const timeout = this.schedulerRegistry.getTimeout(jobName);
      if (timeout) {
        clearTimeout(timeout);
        this.schedulerRegistry.deleteTimeout(jobName);
        this.logger.log(`Cancelled scheduled job for booking ${bookingId}`);
      }
    } catch (error) {
      this.logger.warn(`No scheduled job found for booking ${bookingId}`);
    }
  }
}
