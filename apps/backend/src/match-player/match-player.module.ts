import { forwardRef, Module } from '@nestjs/common';
import { MatchPlayerRepository } from './match-player.repository';
import { MatchJoinRequestRepository } from './match-join-request.repository';
import { MatchPlayerController } from './match-player.controller';
import { MatchPlayerService } from './match-player.service';
import { ProfileModule } from 'src/profile/profile.module';
import { CreditModule } from 'src/credit/credit.module';
import { MatchModule } from 'src/match/match.module';

@Module({
  imports: [
    ProfileModule,
    CreditModule,
    forwardRef(() => MatchModule),
  ],
  providers: [MatchPlayerRepository, MatchJoinRequestRepository, MatchPlayerService],
  exports: [MatchPlayerRepository, MatchJoinRequestRepository, MatchPlayerService],
  controllers: [MatchPlayerController],
})
export class MatchPlayerModule {}
