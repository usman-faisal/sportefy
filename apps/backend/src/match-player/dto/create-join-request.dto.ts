import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJoinRequestDto {
  @ApiPropertyOptional({
    description: 'Preferred team for the match',
    enum: ['A', 'B'],
  })
  @IsOptional()
  @IsEnum(['A', 'B'])
  preferredTeam?: 'A' | 'B';

  @ApiPropertyOptional({
    description: 'Optional message from the requester',
    example: 'Hi! I would love to join your match. I play regularly and am looking for a good game.',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
