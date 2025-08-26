// src/payment/dto/create-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'The number of credits the user wants to purchase.',
    example: 1000,
    enum: [500, 1000, 2000], // Predefined amounts
  })
  @IsIn([500, 1000, 2000])
  @IsInt()
  @Min(500)
  amount: number;

  @ApiProperty({
    description: 'The payment method chosen.',
    example: 'bank_transfer',
    enum: ['bank_transfer'],
  })
  @IsIn(['bank_transfer'])
  @IsNotEmpty()
  method: 'bank_transfer';
}
