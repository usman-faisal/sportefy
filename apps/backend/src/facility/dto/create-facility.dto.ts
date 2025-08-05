import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateMediaDto } from 'src/media/dto/create-media.dto';
import { CreateOperatingHourDto } from 'src/operating-hour/dto/create-operating-hour.dto';

export class CreateFacilityDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  ownerId: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  address: string;

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
}
