import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { UserScopeModule } from './user-scope/user-scope.module';
import { FacilityModule } from './facility/facility.module';
import { VenueModule } from './venue/venue.module';
import { UserModule } from './user/user.module';
import { OperatingHourModule } from './operating-hour/operating-hour.module';
import { MediaModule } from './media/media.module';
import { JwtAuthGuard } from './common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { BookingModule } from './booking/booking.module';
import { MaintenanceScheduleModule } from './maintenance-schedule/maintenance-schedule.module';
import { MatchModule } from './match/match.module';
import { MatchPlayerModule } from './match-player/match-player.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ErrorHandlerService } from './common/services/error-handler.service';
import { CreditModule } from './credit/credit.module';
import { SlotModule } from './slot/slot.module';
import { PaymentModule } from './payment/payment.module';
import { CommonModule } from './common/common.module';
import { BookingOverviewModule } from './admin/booking-overview/booking-overview.module';
import { AdminModule } from './admin/admin.module';
import { TransactionModule } from './transaction/transaction.module';
import { SportModule } from './sport/sport.module';
import { VenueSportModule } from './venue-sport/venue-sport.module';
import { CheckInModule } from './check-in/check-in.module';
import { ReviewModule } from './review/review.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProfileModule,
    UserScopeModule,
    FacilityModule,
    VenueModule,
    UserModule,
    OperatingHourModule,
    MediaModule,
    BookingModule,
    MaintenanceScheduleModule,
    MaintenanceScheduleModule,
    MatchModule,
    MatchPlayerModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    CreditModule,
    SlotModule,
    PaymentModule,
    BookingOverviewModule,
    AdminModule,
    TransactionModule,
    SportModule,
    VenueSportModule,
    CheckInModule,
    ReviewModule,
    SportModule,
    PaymentGatewayModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    ErrorHandlerService,
  ],
})
export class AppModule {}
