import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class TransferCreditsDto {
  @ApiProperty({
    description: 'The email address of the user to receive the credits.',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @ApiProperty({
    description:
      'The number of credits to transfer. Must be a positive integer.',
    example: 100,
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({
    description: 'An optional note or memo for the transaction.',
    example: 'For the friendly match last week!',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
