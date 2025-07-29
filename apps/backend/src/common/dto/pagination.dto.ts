import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'The page number to retrieve',
    type: Number,
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'The number of items per page',
    type: Number,
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100) // Prevent too large page sizes
  limit?: number = 10;

  get offset(): number {
    return this.page && this.limit ? (this.page - 1) * this.limit : 0;
  }
}
