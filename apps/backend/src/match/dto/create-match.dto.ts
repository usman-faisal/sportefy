import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  validate,
  Validate,
} from 'class-validator';
import {
  GenderPreferenceEnum,
  MatchType,
  PaymentSplitType,
  SkillLevel,
} from 'src/common/types';

export class CreateMatchDto {
  @ApiProperty()
  @IsNumber()
  @Validate((value: number) => value === 1 || value % 2 === 0, {
    message: 'playerLimit must be an even number',
  })
  playerLimit: number;

  @ApiProperty()
  @IsEnum(MatchType)
  matchType: MatchType;

  @ApiProperty()
  @IsEnum(PaymentSplitType)
  paymentSplitType: PaymentSplitType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsEnum(GenderPreferenceEnum)
  genderPreference: GenderPreferenceEnum;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  minAge: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  maxAge: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  organizationPreference: string;

  @ApiProperty()
  @IsEnum(SkillLevel)
  @IsOptional()
  skillLevel: SkillLevel;
}
