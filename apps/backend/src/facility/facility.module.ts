import { forwardRef, Module } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';
import { FacilityRepository } from './facility.repository';
import { ProfileModule } from 'src/profile/profile.module';
import { UserScopeModule } from 'src/user-scope/user-scope.module';
import { OperatingHourModule } from 'src/operating-hour/operating-hour.module';
import { VenueModule } from 'src/venue/venue.module';
import { MediaModule } from 'src/media/media.module';
@Module({
  imports: [
    ProfileModule,
    forwardRef(() => UserScopeModule),
    forwardRef(() => OperatingHourModule),
    forwardRef(() => VenueModule),
    forwardRef(() => MediaModule),
  ],
  providers: [FacilityService, FacilityRepository],
  controllers: [FacilityController],
  exports: [FacilityRepository],
})
export class FacilityModule {}
