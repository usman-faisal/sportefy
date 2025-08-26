import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PurchaseMembershipDto {
  @ApiProperty({
    description: 'The ID of the membership plan to purchase',
    example: '...',
  })
  @IsUUID()
  planId: string;
}
