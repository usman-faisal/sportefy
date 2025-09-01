import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class SwitchTeamDto {
    @ApiProperty({
        description: 'The team to switch to',
        enum: ['A', 'B'],
        example: 'B'
    })
    @IsEnum(['A', 'B'], { message: 'Team must be either A or B' })
    @IsNotEmpty()
    team: 'A' | 'B';
}