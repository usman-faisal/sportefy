import { forwardRef, Module } from '@nestjs/common';
import { SlotService } from './slot.service';
import { SlotRepository } from './slot.repository';
import { VenueModule } from 'src/venue/venue.module';
import { OperatingHourModule } from 'src/operating-hour/operating-hour.module';
import { SlotController } from './slot.controller';

@Module({
  imports: [
    forwardRef(() => VenueModule),
    forwardRef(() => OperatingHourModule),
  ],
  providers: [SlotService, SlotRepository],
  exports: [SlotService, SlotRepository],
  controllers: [SlotController],
})
export class SlotModule {}
