import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Availability } from 'src/common/types';
import { NewVenue } from '@sportefy/db-types';
import { CreateMediaDto } from 'src/media/dto/create-media.dto';
import { CreateOperatingHourDto } from 'src/operating-hour/dto/create-operating-hour.dto';

export type CreateVenueDtoValues = Omit<
  NewVenue,
  'id' | 'createdAt' | 'updatedAt' | 'facilityId'
>;

export class CreateVenueDto implements CreateVenueDtoValues {
  @ApiProperty({
    description: 'The name of the venue',
    example: 'Central Court',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({
    description: 'Contact phone number for the venue',
    example: '+1234567890',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @ApiProperty({
    description: 'An array of sport IDs that this venue supports.',
    type: [String],
    example: ['uuid-for-badminton', 'uuid-for-squash'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  sportIds: string[];

  @ApiProperty({
    description: 'Type of space (indoor or outdoor)',
    enum: ['indoor', 'outdoor'],
    example: 'indoor',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(['indoor', 'outdoor'])
  spaceType?: 'indoor' | 'outdoor' | null;

  @ApiProperty({
    description: 'Current availability status of the venue',
    enum: ['active', 'inactive', 'maintenance'],
    example: 'active',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability;

  @ApiProperty({
    description: 'Base price for using the venue',
    example: 50,
    minimum: 0,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  basePrice: number;

  @ApiProperty({
    description: 'Maximum capacity of the venue',
    example: 100,
    minimum: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  capacity: number;

  @ApiProperty({ type: [CreateOperatingHourDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOperatingHourDto)
  operatingHours: CreateOperatingHourDto[];

  @ApiProperty({ type: [CreateMediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media: CreateMediaDto[];

  @ApiProperty({
    description: 'Latitude coordinate of the venue location',
    example: 40.7128,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @ApiProperty({
    description: 'Longitude coordinate of the venue location',
    example: -74.0060,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number | null;
}
