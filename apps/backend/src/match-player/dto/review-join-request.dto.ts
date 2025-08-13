import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewJoinRequestDto {
  @ApiProperty({
    description: 'Decision on the join request',
    enum: ['approved', 'rejected'],
  })
  @IsEnum(['approved', 'rejected'])
  decision: 'approved' | 'rejected';

  @ApiPropertyOptional({
    description: 'Optional team assignment for approved requests',
    enum: ['A', 'B'],
  })
  @IsOptional()
  @IsEnum(['A', 'B'])
  assignedTeam?: 'A' | 'B';
}
