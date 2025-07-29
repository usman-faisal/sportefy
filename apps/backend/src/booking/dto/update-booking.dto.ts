import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { BookingStatus } from 'src/common/types';

export class UpdateBookingDto {
  @ApiProperty({
    type: String,
    description: 'The new status of the booking',
    example: 'confirmed',
  })
  @IsIn([BookingStatus.CONFIRMED, BookingStatus.CANCELLED])
  status: BookingStatus.CONFIRMED | BookingStatus.CANCELLED;
}
