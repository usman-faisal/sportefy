import { IsNotEmpty, IsUUID } from 'class-validator';

export class WalkInCheckInDto {
  @IsUUID()
  @IsNotEmpty()
  venueId: string;

  @IsUUID()
  @IsNotEmpty()
  sportId: string;
}
