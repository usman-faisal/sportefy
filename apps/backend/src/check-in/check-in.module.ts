import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BookingModule } from 'src/booking/booking.module';
import { MatchPlayerModule } from 'src/match-player/match-player.module';
import { MatchModule } from 'src/match/match.module';
import { CheckInService } from './check-in.service';
import { CheckInRepository } from './check-in.repository';
import { CheckInController, VenueCheckInController } from './check-in.controller';
import { ProfileModule } from 'src/profile/profile.module';
import { VenueSportModule } from 'src/venue-sport/venue-sport.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    BookingModule,
    MatchPlayerModule,
    MatchModule,
    ProfileModule,
    VenueSportModule,
  ],
  providers: [CheckInService, CheckInRepository],
  exports: [CheckInService, CheckInRepository],
  controllers: [CheckInController, VenueCheckInController],
})
export class CheckInModule {}
