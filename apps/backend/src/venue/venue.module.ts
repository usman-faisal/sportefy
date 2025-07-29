import { forwardRef, Module } from '@nestjs/common';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { VenueRepository } from './venue.repository';
import { OperatingHourModule } from 'src/operating-hour/operating-hour.module';
import { MediaModule } from 'src/media/media.module';
import { FacilityModule } from 'src/facility/facility.module';
import { SlotModule } from 'src/slot/slot.module';
import { UserScopeModule } from 'src/user-scope/user-scope.module';
import { VenueSportModule } from 'src/venue-sport/venue-sport.module';

@Module({
  imports: [
    forwardRef(() => MediaModule),
    forwardRef(() => OperatingHourModule),
    forwardRef(() => FacilityModule),
    forwardRef(() => SlotModule),
    forwardRef(() => UserScopeModule),
  ],
  providers: [VenueService, VenueRepository],
  exports: [VenueService, VenueRepository],
  controllers: [VenueController],
})
export class VenueModule {}
