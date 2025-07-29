// src/slots/dto/get-venue-slots.query.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class GetVenueSlotsQuery {
  @ApiProperty({
    description:
      'The specific date to retrieve slots for, in YYYY-MM-DD format. Cannot be used with startDate or endDate.',
    example: '2025-08-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => !o.startDate && !o.endDate)
  date?: string;

  @ApiProperty({
    description:
      'The start date of the range to retrieve slots for, in YYYY-MM-DD format. Must be used with endDate, and cannot be used with date.',
    example: '2025-08-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => !o.date)
  startDate?: string;

  @ApiProperty({
    description:
      'The end date of the range to retrieve slots for, in YYYY-MM-DD format. Must be used with startDate, and cannot be used with date.',
    example: '2025-08-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => !o.date)
  endDate?: string;
}
