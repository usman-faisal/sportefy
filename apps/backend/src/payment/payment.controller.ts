// src/payment/payment.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/common/types';
import { Profile } from '@sportefy/db-types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UploadProofDto } from './dto/upload-proof.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payments & Credits')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Auth(UserRole.USER)
  @Post('top-up')
  @ApiOperation({ summary: 'Initiate a credit top-up (Bank Transfer)' })
  @ApiBody({ type: CreatePaymentDto })
  initiateTopUp(
    @CurrentUser() user: Profile,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.initiateTopUp(user, createPaymentDto);
  }

  @Auth(UserRole.USER)
  @Patch(':id/proof')
  @ApiOperation({ summary: 'Upload proof of payment for a bank transfer' })
  @ApiParam({ name: 'id', description: 'The ID of the payment record' })
  @ApiBody({ type: UploadProofDto })
  uploadProof(
    @CurrentUser() user: Profile,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() uploadProofDto: UploadProofDto,
  ) {
    return this.paymentService.uploadPaymentProof(user, id, uploadProofDto);
  }

  @Auth(UserRole.ADMIN)
  @Get('pending')
  @ApiOperation({ summary: 'ADMIN: Get all payments pending verification' })
  getPendingPayments(@CurrentUser() admin: Profile) {
    return this.paymentService.getPendingPayments(admin);
  }

  @Auth(UserRole.ADMIN)
  @Patch(':id/verify')
  @ApiOperation({ summary: 'ADMIN: Approve or reject a pending payment' })
  @ApiParam({ name: 'id', description: 'The ID of the payment to verify' })
  @ApiBody({ type: VerifyPaymentDto })
  verifyPayment(
    @CurrentUser() admin: Profile,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() verifyPaymentDto: VerifyPaymentDto,
  ) {
    return this.paymentService.verifyPayment(admin, id, verifyPaymentDto);
  }

  @Auth(UserRole.USER)
  @Get('history')
  @ApiOperation({ summary: "Get the current user's transaction history" })
  getMyTransactionHistory(@CurrentUser() user: Profile) {
    return this.paymentService.getMyTransactionHistory(user);
  }

  @Auth(UserRole.ADMIN)
  @Get('user/:userId/history')
  @ApiOperation({ summary: 'ADMIN: Get a specific user\'s transaction history' })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  getUserTransactionHistory(
    @CurrentUser() admin: Profile,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.paymentService.getUserTransactionHistory(userId);
  }
  
}
