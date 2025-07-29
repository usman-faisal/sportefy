import { Module } from '@nestjs/common';
import { MaintenanceScheduleController } from './maintenance-schedule.controller';
import { MaintenanceScheduleService } from './maintenance-schedule.service';
import { MaintenanceScheduleRepository } from './maintenance-schedule.repository';
import { VenueModule } from 'src/venue/venue.module';
import { SlotModule } from 'src/slot/slot.module';
import { UserScopeModule } from 'src/user-scope/user-scope.module';
import { OperatingHourModule } from 'src/operating-hour/operating-hour.module';

@Module({
  imports: [
    VenueModule,
    SlotModule,
    UserScopeModule,
    SlotModule,
    OperatingHourModule,
  ],
  controllers: [MaintenanceScheduleController],
  providers: [MaintenanceScheduleService, MaintenanceScheduleRepository],
  exports: [MaintenanceScheduleRepository],
})
export class MaintenanceScheduleModule {}
