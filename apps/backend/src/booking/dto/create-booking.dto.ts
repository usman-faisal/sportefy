import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsUUID, ValidateNested } from 'class-validator';
import { MatchType, type MatchPreference } from 'src/common/types';
import { CreateMatchDto } from 'src/match/dto/create-match.dto';
import { CreateSlotDto } from 'src/slot/dto/create-slot.dto';

export class CreateBookingDto {
  @ApiProperty({ type: CreateSlotDto })
  @Type(() => CreateSlotDto)
  @ValidateNested()
  @IsObject()
  slot: CreateSlotDto;

  @ApiProperty({ type: CreateMatchDto })
  @Type(() => CreateMatchDto)
  @ValidateNested()
  @IsObject()
  match: CreateMatchDto;

  @ApiProperty()
  @IsUUID()
  venueId: string;

  @ApiProperty()
  @IsUUID()
  sportId: string;
}
