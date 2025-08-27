import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateMediaDto } from 'src/media/dto/create-media.dto';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID of the venue being reviewed' })
  @IsUUID()
  venueId: string;

  @ApiProperty({ description: 'Comment for the review' })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({ description: 'Rating for the review', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ type: [CreateMediaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media: CreateMediaDto[];
}
