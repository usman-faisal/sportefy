import { forwardRef, Module } from '@nestjs/common';
import { OperatingHourService } from './operating-hour.service';
import { OperatingHourController } from './operating-hour.controller';
import { OperatingHourRepository } from './operating-hour.repository';
import { UserScopeModule } from 'src/user-scope/user-scope.module';
import { VenueModule } from 'src/venue/venue.module';

@Module({
  imports: [forwardRef(() => UserScopeModule), forwardRef(() => VenueModule)],
  providers: [OperatingHourService, OperatingHourRepository],
  controllers: [OperatingHourController],
  exports: [OperatingHourService, OperatingHourRepository],
})
export class OperatingHourModule {}
