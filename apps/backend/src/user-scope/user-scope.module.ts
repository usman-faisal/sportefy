import { forwardRef, Module } from '@nestjs/common';
import { UserScopeService } from './user-scope.service';
import { UserScopeController } from './user-scope.controller';
import { UserScopeRepository } from './user-scope.repository';
import { FacilityModule } from 'src/facility/facility.module';
import { VenueModule } from 'src/venue/venue.module';

@Module({
  imports: [forwardRef(() => FacilityModule), forwardRef(() => VenueModule)],
  providers: [UserScopeService, UserScopeRepository],
  controllers: [UserScopeController],
  exports: [UserScopeRepository, UserScopeService],
})
export class UserScopeModule {}
