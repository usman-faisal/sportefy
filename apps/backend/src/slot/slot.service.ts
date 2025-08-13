import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VenueRepository } from 'src/venue/venue.repository';
import { OperatingHour, Slot, slots, Venue } from '@sportefy/db-types';
import { OperatingHourRepository } from 'src/operating-hour/operating-hour.repository';
import { and, asc, between, eq } from 'drizzle-orm';
import { operatingHours } from '@sportefy/db-types';
import { DayOfWeek } from 'src/common/types';
import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { SlotRepository } from './slot.repository';
import { endOfDay } from 'date-fns/endOfDay';
import { isBefore, parseISO, startOfDay } from 'date-fns';
import { GetVenueSlotsQuery } from './dto/get-venue-slots.dto';

export interface ValidateTimeSlotOptions {
  slotIdToExclude?: string;
  eventIdToExclude?: string;
}

@Injectable()
export class SlotService {
  private readonly TIMEZONE_PAKISTAN = 'Asia/Karachi';

  constructor(
    private readonly venueRepository: VenueRepository,
    private readonly operatingHourRepository: OperatingHourRepository,
    private readonly slotRepository: SlotRepository,
  ) {}

  async validateTimeSlot(
    venueId: string,
    startTime: Date,
    endTime: Date,
    options: ValidateTimeSlotOptions = {},
  ) {
    if (endTime.getTime() <= startTime.getTime()) {
      throw new BadRequestException('End time must be after start time.');
    }

    const durationInMs = endTime.getTime() - startTime.getTime();
    const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;

    if (durationInMs > THREE_HOURS_IN_MS) {
      throw new BadRequestException(
        'The time slot duration cannot exceed 3 hours.',
      );
    }

    this.checkFutureDate(startTime);

    const venue = await this.venueRepository.getVenueById(venueId, {
      slots: true,
      operatingHours: true,
    });

    if (!venue) {
      throw new NotFoundException('Venue not found during validation');
    }

    await this.checkOperatingHours(startTime, endTime, venue);

    this.checkTimeConflicts(startTime, endTime, venue.slots, options);
  }

  private checkFutureDate(startTime: Date) {
    if (startTime.getTime() <= new Date().getTime()) {
      throw new BadRequestException('Start time must be in the future.');
    }
  }

  private async checkOperatingHours(
    startTime: Date,
    endTime: Date,
    venue: Venue & { operatingHours: OperatingHour[] },
  ) {
    const zonedStartTime = toZonedTime(startTime, this.TIMEZONE_PAKISTAN);
    const dayOfWeek = format(zonedStartTime, 'EEEE') as DayOfWeek; // E.g., "Monday"

    let relevantHourIntervals =
      venue.operatingHours?.filter((oh) => oh.dayOfWeek === dayOfWeek) ?? [];

    if (relevantHourIntervals.length === 0 && venue.facilityId) {
      relevantHourIntervals =
        await this.operatingHourRepository.getManyOperatingHours(
          and(
            eq(operatingHours.facilityId, venue.facilityId),
            eq(operatingHours.dayOfWeek, dayOfWeek),
          ),
        );
    }

    if (relevantHourIntervals.length === 0) {
      throw new BadRequestException(`The venue is closed on ${dayOfWeek}s.`);
    }

    const isWithinOperatingHours = relevantHourIntervals.some((interval) => {
      if (!interval.openTime || !interval.closeTime) {
        return false;
      }

      const operatingOpenTimeStr = `${format(zonedStartTime, 'yyyy-MM-dd')} ${interval.openTime}`;
      const operatingCloseTimeStr = `${format(zonedStartTime, 'yyyy-MM-dd')} ${interval.closeTime}`;

      const operatingOpenUTC = fromZonedTime(
        operatingOpenTimeStr,
        this.TIMEZONE_PAKISTAN,
      );
      const operatingCloseUTC = fromZonedTime(
        operatingCloseTimeStr,
        this.TIMEZONE_PAKISTAN,
      );

      return (
        startTime.getTime() >= operatingOpenUTC.getTime() &&
        endTime.getTime() <= operatingCloseUTC.getTime()
      );
    });

    if (!isWithinOperatingHours) {
      throw new BadRequestException(
        `The requested time is outside of the venue's operating hours for ${dayOfWeek}.`,
      );
    }
  }

  private checkTimeConflicts(
    startTime: Date,
    endTime: Date,
    existingSlots: Slot[],
    options: ValidateTimeSlotOptions,
  ) {
    const slotsToCheck = existingSlots.filter((slot) => {
      if (options.slotIdToExclude && slot.id === options.slotIdToExclude)
        return false;
      if (options.eventIdToExclude && slot.eventId === options.eventIdToExclude)
        return false;
      return true;
    });

    const hasConflict = slotsToCheck.some((slot) => {
      const itemStart = new Date(slot.startTime);
      const itemEnd = new Date(slot.endTime);

      return startTime < itemEnd && endTime > itemStart;
    });

    if (hasConflict) {
      throw new ConflictException(
        'The requested time slot conflicts with an existing booking or maintenance schedule.',
      );
    }
  }

  async getVenueSlotsByDateOrRange(venueId: string, query: GetVenueSlotsQuery) {
    const { date, startDate, endDate } = query;
    let conditions: any;


    if (date) {
      const dayStart = startOfDay(parseISO(date));
      const dayEnd = endOfDay(parseISO(date));

      conditions = and(
        eq(slots.venueId, venueId),
        between(slots.startTime, dayStart, dayEnd),
      );
    } else if (startDate && endDate) {
      const parsedStartDate = parseISO(startDate);
      const parsedEndDate = parseISO(endDate);

      if (isBefore(parsedEndDate, parsedStartDate)) {
        throw new BadRequestException('End date cannot be before start date.');
      }
      const rangeEnd = endOfDay(parsedEndDate);

      conditions = and(
        eq(slots.venueId, venueId),
        between(slots.startTime, parsedStartDate, rangeEnd),
      );
    } else {
      throw new BadRequestException(
        'Either "date" or both "startDate" and "endDate" must be provided.',
      );
    }

    const fetchedSlots = await this.slotRepository.getManySlots(
      conditions,
      undefined,
      undefined,
      undefined,
      asc(slots.startTime),
    );

    if (!fetchedSlots || fetchedSlots.length === 0) {
      return ResponseBuilder.success(
        [],
        'No slots found for the specified period.',
      );
    }

    return ResponseBuilder.success(
      fetchedSlots,
      'Slots retrieved successfully',
    );
  }
}
