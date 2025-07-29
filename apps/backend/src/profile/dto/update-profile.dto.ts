import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { GenderEnum } from 'src/common/types';

export class UpdateProfileDto {
  @ApiProperty({
    type: String,
    description: 'Full name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName: string;

  @ApiProperty({
    type: String,
    description: 'Avatar URL of the user',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  avatarUrl: string;

  @ApiProperty({
    type: String,
    description: 'Username of the user',
    example: 'johndoe',
    required: false,
  })
  @IsOptional()
  @IsString()
  userName: string;

  @ApiProperty({
    type: String,
    description: 'Gender of the user',
    example: 'male',
    required: false,
  })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @ApiProperty({
    type: Number,
    description: 'Age of the user',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  age: number;

  @ApiProperty({
    type: String,
    description: 'Address of the user',
    example: '123 Main St',
    required: false,
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({
    type: String,
    description: 'Organization of the user',
    example: 'Acme Corp',
    required: false,
  })
  @IsOptional()
  @IsString()
  organization: string;

  @ApiProperty({
    type: String,
    description: 'Phone number of the user',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber: string;
}
