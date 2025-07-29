import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingController } from './booking.controller';
import { BookingSchedulerService } from './booking-scheduler.service';
import { ProfileModule } from 'src/profile/profile.module';
import { SlotModule } from 'src/slot/slot.module';
import { MatchPlayerModule } from 'src/match-player/match-player.module';
import { OperatingHourModule } from 'src/operating-hour/operating-hour.module';
import { VenueModule } from 'src/venue/venue.module';
import { MatchModule } from 'src/match/match.module';
import { CreditModule } from 'src/credit/credit.module';
import { JwtModule } from '@nestjs/jwt';
import { CheckInService } from 'src/check-in/check-in.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VenueSportModule } from 'src/venue-sport/venue-sport.module';
import { CheckInModule } from 'src/check-in/check-in.module';

@Module({
  imports: [
    ProfileModule,
    SlotModule,
    MatchPlayerModule,
    forwardRef(() => MatchModule),
    OperatingHourModule,
    VenueModule,
    CreditModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    VenueSportModule,
  ],
  providers: [BookingService, BookingRepository, BookingSchedulerService],
  controllers: [BookingController],
  exports: [BookingRepository],
})
export class BookingModule {}
