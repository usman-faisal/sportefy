import { Module } from '@nestjs/common';
import { MatchPlayerRepository } from './match-player.repository';
import { MatchPlayerController } from './match-player.controller';
import { MatchPlayerService } from './match-player.service';

@Module({
  providers: [MatchPlayerRepository, MatchPlayerService],
  exports: [MatchPlayerRepository],
  controllers: [MatchPlayerController],
})
export class MatchPlayerModule {}
