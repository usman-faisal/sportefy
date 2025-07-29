import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchUsersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term for name, email, or phone number.',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
