import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'The verification status.',
    example: 'approved',
    enum: ['approved', 'rejected'],
  })
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ApiProperty({
    description: 'Reason for rejection (required if status is "rejected").',
    example: 'Screenshot is not clear.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  rejectionReason?: string;
}
