import { ApiProperty } from '@nestjs/swagger';

export class BookingStatsResponseDto {
  @ApiProperty({
    description: 'Total revenue from all bookings',
    example: 15000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Total number of bookings',
    example: 250,
  })
  totalBookings: number;

  @ApiProperty({
    description: 'Number of confirmed bookings',
    example: 180,
  })
  confirmedBookings: number;

  @ApiProperty({
    description: 'Number of cancelled bookings',
    example: 45,
  })
  cancelledBookings: number;
}
