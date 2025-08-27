import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateMembershipDto {
  @ApiProperty({ maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price in the smallest currency unit (e.g., cents)' })
  @IsInt()
  @IsPositive()
  price: number;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  creditsGranted: number;

  @ApiProperty({ default: 0 })
  @IsInt()  
  @Min(0)
  checkInsGranted: number;

  @ApiProperty({ description: 'Duration of membership in days' })
  @IsInt()
  @IsPositive()
  durationDays: number;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


