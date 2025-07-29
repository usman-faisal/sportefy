import { Module } from '@nestjs/common';
import { VenueSportRepository } from './venue-sport.repository';

@Module({
    providers: [VenueSportRepository],
    exports: [VenueSportRepository]
})
export class VenueSportModule {}
