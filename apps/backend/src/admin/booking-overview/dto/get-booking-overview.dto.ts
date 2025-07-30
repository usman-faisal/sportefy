import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class GetBookingOverviewDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'The date for the overview in YYYY-MM-DD format. Defaults to today.',
    example: '2025-07-22',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date = new Date();
}
