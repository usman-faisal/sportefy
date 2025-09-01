import { IsNotEmpty, IsUUID } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;
}
