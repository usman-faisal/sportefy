import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GenderPreferenceEnum, SkillLevel } from 'src/common/types';

export class FilterMatchesDto extends PaginationDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ type: [String], description: 'List of sport IDs or names' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim());
    }
    return value;
  })
  sports?: string[];

  @IsOptional()
  @IsEnum(GenderPreferenceEnum)
  @ApiPropertyOptional({ enum: GenderPreferenceEnum })
  gender?: GenderPreferenceEnum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiPropertyOptional({ type: Number, minimum: 0, maximum: 100 })
  age?: number;

  @IsOptional()
  @IsEnum(SkillLevel)
  @ApiPropertyOptional({ enum: SkillLevel })
  skillLevel?: SkillLevel;
}
