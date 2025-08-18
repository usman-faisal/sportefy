import { Module } from '@nestjs/common';
import { MatchPlayerRepository } from './match-player.repository';

@Module({
  imports: [],
  providers: [MatchPlayerRepository],
  exports: [MatchPlayerRepository],
})
export class MatchPlayerModule {}
