import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class GetBookingsDto extends PaginationDto {
  @ApiProperty({
    description: 'status of bookings upcoming/previous',
    required: false,
    enum: ['upcoming', 'previous'],
  })
  @IsOptional()
  @IsString()
  status?: 'upcoming' | 'previous';
}
