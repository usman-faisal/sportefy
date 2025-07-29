import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'Set to true to block the user, false to unblock.',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isBlocked: boolean;
}
