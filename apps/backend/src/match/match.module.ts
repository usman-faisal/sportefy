import { forwardRef, Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchRepository } from './match.repository';
import { MatchController } from './match.controller';
import { VenueModule } from 'src/venue/venue.module';
import { OperatingHourModule } from 'src/operating-hour/operating-hour.module';
import { SlotModule } from 'src/slot/slot.module';
import { MatchPlayerModule } from 'src/match-player/match-player.module';
import { ProfileModule } from 'src/profile/profile.module';
import { BookingModule } from 'src/booking/booking.module';
import { CreditModule } from 'src/credit/credit.module';

@Module({
  imports: [
    VenueModule,
    OperatingHourModule,
    forwardRef(() => MatchPlayerModule),
    ProfileModule,
    forwardRef(() => BookingModule),
    CreditModule,
    SlotModule,
  ],
  providers: [MatchService, MatchRepository],
  exports: [MatchRepository],
  controllers: [MatchController],
})
export class MatchModule {}
