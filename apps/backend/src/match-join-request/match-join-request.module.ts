import { forwardRef, Module } from '@nestjs/common';
import { MatchJoinRequestService } from './match-join-request.service';
import { MatchJoinRequestController } from './match-join-request.controller';
import { MatchJoinRequestRepository } from './match-join-request.repository';
import { MatchPlayerModule } from 'src/match-player/match-player.module';
import { MatchModule } from 'src/match/match.module';
import { ProfileModule } from 'src/profile/profile.module';
import { CreditModule } from 'src/credit/credit.module';

@Module({
  imports: [
    forwardRef(() => MatchModule),
    MatchPlayerModule,
    ProfileModule,
    CreditModule
  ],
  providers: [MatchJoinRequestService, MatchJoinRequestRepository],
  controllers: [MatchJoinRequestController],
  exports: [MatchJoinRequestService, MatchJoinRequestRepository],
})
export class MatchJoinRequestModule {}
