import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ReportRepository } from './report.repository';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  imports: [ProfileModule],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
})
export class ReportModule {}
