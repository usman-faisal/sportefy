import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { maintenanceSchedules } from '@sportefy/db-types';
import { CreateMaintenanceScheduleDto } from './dto/create-maintenance-schedule.dto';
import { UpdateMaintenanceScheduleDto } from './dto/update-maintenance-schedule.dto';

import { VenueRepository } from 'src/venue/venue.repository';
import { MaintenanceScheduleRepository } from './maintenance-schedule.repository';
import { SlotRepository } from 'src/slot/slot.repository';
import { SlotEventType } from 'src/common/types';
import { slots } from '@sportefy/db-types';
import { SlotService } from 'src/slot/slot.service';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';
import { ResponseBuilder } from 'src/common/utils/response-builder';

@Injectable()
export class MaintenanceScheduleService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleClient,
    private readonly maintenanceScheduleRepository: MaintenanceScheduleRepository,
    private readonly venueRepository: VenueRepository,
    private readonly slotRepository: SlotRepository,
    private readonly slotService: SlotService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async getMaintenanceSchedules(venueId: string) {
    const maintenanceSchdules = await this.maintenanceScheduleRepository.getManyMaintenanceSchedules(
      eq(maintenanceSchedules.venueId, venueId),
      {slot:true, scheduledByUser:true}
    );

    return ResponseBuilder.success(maintenanceSchdules);
  }

  async createMaintenanceSchedule(
    venueId: string,
    userId: string,
    createMaintenanceScheduleDto: CreateMaintenanceScheduleDto,
  ) {
    const venue = await this.venueRepository.getVenueById(venueId, {
      operatingHours: true,
      slots: true,
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    const { endTime, startTime } = createMaintenanceScheduleDto.slot;
    const endTimeDate = new Date(endTime);
    const startTimeDate = new Date(startTime);

    await this.slotService.validateTimeSlot(
      venueId,
      startTimeDate,
      endTimeDate,
    );

    const result = await this.unitOfWork.do(async (tx) => {
      const newMaintenanceSchedule =
        await this.maintenanceScheduleRepository.createMaintenanceSchedule(
          {
            venueId,
            ...createMaintenanceScheduleDto,
            scheduledBy: userId,
          },
          tx,
        );
      await this.slotRepository.createSlot(
        {
          startTime: createMaintenanceScheduleDto.slot.startTime,
          endTime: createMaintenanceScheduleDto.slot.endTime,
          eventId: newMaintenanceSchedule.id,
          eventType: SlotEventType.MAINTENANCE,
          venueId,
        },
        tx,
      );
      return newMaintenanceSchedule;
    });

    return ResponseBuilder.success(result, 'Maintenance schedule created successfully');
  }

  async updateMaintenanceSchedule(
    id: string, // This is the maintenance schedule ID (eventId)
    updateDto: UpdateMaintenanceScheduleDto,
  ) {
    const existingSlot = await this.slotRepository.getSlot(
      and(
        eq(slots.eventId, id),
        eq(slots.eventType, SlotEventType.MAINTENANCE),
      ),
    );

    if (!existingSlot) {
      throw new NotFoundException('Maintenance schedule not found');
    }

    // --- REFACTORED VALIDATION ---
    if (updateDto.slot) {
      const { startTime, endTime } = updateDto.slot;
      const newStartTime = startTime
        ? new Date(startTime)
        : new Date(existingSlot.startTime);
      const newEndTime = endTime
        ? new Date(endTime)
        : new Date(existingSlot.endTime);

      // Use the validation service, excluding the current event from the conflict check
      await this.slotService.validateTimeSlot(
        existingSlot.venueId,
        newStartTime,
        newEndTime,
        { eventIdToExclude: id }, // <-- Key part for updates
      );
    }
    // --- END OF VALIDATION ---

    const result = await this.unitOfWork.do(async (tx) => {
      if (updateDto.slot) {
        await this.slotRepository.updateSlot(
          and(
            eq(slots.eventId, id),
            eq(slots.eventType, SlotEventType.MAINTENANCE),
          ),
          { ...updateDto.slot },
          tx,
        );
      }
      // Update the maintenance schedule details (e.g., reason)
      return this.maintenanceScheduleRepository.updateMaintenanceScheduleById(
        id,
        { reason: updateDto.reason },
        tx,
      );
    });

    return ResponseBuilder.updated(result, 'Maintenance schedule updated successfully');
  }

  async deleteMaintenanceSchedule(id: string) {
    const existingSchedule =
      await this.maintenanceScheduleRepository.getMaintenanceScheduleById(id);

    if (!existingSchedule) {
      throw new NotFoundException('Maintenance schedule not found');
    }

    await this.unitOfWork.do(async (tx) => {
      await Promise.all([
        this.maintenanceScheduleRepository.deleteMaintenanceScheduleById(id, tx),
        this.slotRepository.deleteSlot(
          eq(slots.eventId, id),
          tx,
        ),
      ]);
    });

    return ResponseBuilder.deleted('Maintenance schedule deleted successfully');
  }
}
