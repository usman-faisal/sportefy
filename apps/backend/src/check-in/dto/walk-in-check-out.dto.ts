import { IsNotEmpty, IsUUID } from 'class-validator';

export class WalkInCheckOutDto {
  @IsUUID()
  @IsNotEmpty()
  venueId: string;
}
