import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/types';
import { ReportService } from './report.service';

@ApiTags('Admin: Reports')
@Auth(UserRole.ADMIN)
@Controller('admin/reports')
export class ReportController {
  constructor(private readonly reportsService: ReportService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get key metrics for the admin dashboard' })
  getDashboardReports() {
    return this.reportsService.getDashboardReports();
  }
}
