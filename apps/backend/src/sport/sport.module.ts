import { Module } from '@nestjs/common';
import { SportRepository } from './sport.repository';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';

@Module({
  providers: [SportRepository, SportService],
  exports: [SportRepository],
  controllers: [SportController],
})
export class SportModule {}
