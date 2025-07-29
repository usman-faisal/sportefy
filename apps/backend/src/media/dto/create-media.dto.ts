import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { MediaType } from 'src/common/types';

export class CreateMediaDto {
  @IsNotEmpty()
  @IsString()
  mediaLink: string;

  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType = MediaType.IMAGE;
}