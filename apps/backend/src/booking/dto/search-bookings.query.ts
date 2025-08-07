import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BookingStatus } from 'src/common/types';

export class SearchBookingsQuery extends PaginationDto {
  @ApiProperty({
    description: 'Filter by venue ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  venueId?: string;

  @ApiProperty({
    description: 'Filter by facility ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @ApiProperty({
    description: 'Filter by booking status',
    enum: BookingStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({
    description: 'Filter by user ID who made the booking',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  bookedBy?: string;

  @ApiProperty({
    description: 'Filter by sport ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sportId?: string;
}
