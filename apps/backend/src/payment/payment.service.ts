// src/payment/payment.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Profile } from '@sportefy/db-types';
import { ProfileRepository } from 'src/profile/profile.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { UploadProofDto } from './dto/upload-proof.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async initiateTopUp(user: Profile, createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentRepository.createPayment({
      userId: user.id,
      amountCredits: createPaymentDto.amount,
      method: createPaymentDto.method,
    });

    return ResponseBuilder.created(
      {
        paymentId: payment.id,
        instructions:
          'Please transfer the amount to XYZ Bank, Account: 12345. Use your email as the reference. Then upload the screenshot.',
      },
      'Payment initiated. Please follow the instructions.',
    );
  }

  async uploadPaymentProof(
    user: Profile,
    paymentId: string,
    uploadProofDto: UploadProofDto,
  ) {
    const payment = await this.paymentRepository.getPaymentById(paymentId);
    if (!payment) throw new NotFoundException('Payment record not found.');
    if (payment.userId !== user.id)
      throw new ForbiddenException('You cannot modify this payment.');
    if (payment.status !== 'pending')
      throw new BadRequestException('This payment is already processed.');

    const updatedPayment = await this.paymentRepository.updatePayment(
      paymentId,
      {
        screenshotUrl: uploadProofDto.screenshotUrl,
      },
    );

    return ResponseBuilder.success(
      updatedPayment,
      'Payment proof uploaded. Awaiting verification.',
    );
  }

  async getPendingPayments(admin: Profile) {
    // Future: Could add pagination here
    const pending = await this.paymentRepository.getPendingPayments();
    return ResponseBuilder.success(pending);
  }

  async verifyPayment(
    admin: Profile,
    paymentId: string,
    verifyPaymentDto: VerifyPaymentDto,
  ) {
    const { status, rejectionReason } = verifyPaymentDto;

    const payment = await this.paymentRepository.getPaymentById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found.');
    if (payment.status !== 'pending')
      throw new BadRequestException('Payment has already been processed.');
    if (status === 'rejected' && !rejectionReason)
      throw new BadRequestException('Rejection reason is required.');

    const result = await this.unitOfWork.do(async (tx) => {
      const updatedPayment = await this.paymentRepository.updatePayment(
        paymentId,
        {
          status,
          rejectionReason,
          verifiedBy: admin.id,
        },
        tx,
      );

      if (status === 'approved') {
        // 1. Add credits to the user's profile
        await this.profileRepository.updateProfileCreditsById(
          payment.userId,
          payment.amountCredits,
          tx,
        );

        // 2. Log this in the transaction ledger
        await this.paymentRepository.createTransaction(
          {
            userId: payment.userId,
            type: 'top_up',
            amount: payment.amountCredits,
            paymentId: payment.id,
          },
          tx,
        );
      }

      return updatedPayment;
    });

    // Emit events for notifications
    this.eventEmitter.emit(`payment.${status}`, {
      userId: payment.userId,
      amount: payment.amountCredits,
      reason: rejectionReason,
    });

    return ResponseBuilder.success(result, `Payment successfully ${status}.`);
  }

  async getMyTransactionHistory(user: Profile) {
    const history = await this.paymentRepository.getUserTransactions(user.id);
    return ResponseBuilder.success(history);
  }
}
