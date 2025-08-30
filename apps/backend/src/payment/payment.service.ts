// src/payment/payment.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Membership, Profile } from '@sportefy/db-types';
import { ProfileRepository } from 'src/profile/profile.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { UploadProofDto } from './dto/upload-proof.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';
import { TransactionRepository } from 'src/transaction/transaction.repository';
import { UserMembershipRepository } from 'src/user-membership/user-membership.repository';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly unitOfWork: UnitOfWork,
    private readonly userMembershipRepository: UserMembershipRepository,
  ) {}

  async initiateTopUp(user: Profile, createPaymentDto: CreatePaymentDto) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await this.paymentRepository.getActivePendingPaymentForUser(
      user.id,
      oneHourAgo,
    );
    if (existing) {
      throw new ConflictException(
        'You already have a pending payment. Please upload proof or wait 1 hour.',
      );
    }

    const payment = await this.paymentRepository.createPayment({
      userId: user.id,
      amount: createPaymentDto.amount,
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

  async initiateMembershipPayment(user: Profile, plan: Membership) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await this.paymentRepository.getActivePendingPaymentForUser(
      user.id,
      oneHourAgo,
    );
    if (existing) {
      throw new ConflictException(
        'You already have a pending payment. Please upload proof or wait 1 hour.',
      );
    }

    const payment = await this.paymentRepository.createPayment({
      userId: user.id,
      amount: plan.price,
      method: 'bank_transfer',
      purchasedMembershipId: plan.id,
    });

    return ResponseBuilder.created(
      {
        paymentId: payment.id,
        instructions: `Please transfer ${plan.price / 100} to purchase the ${
          plan.name
        } plan. Use your email as the reference.`,
      },
      'Membership purchase initiated. Please follow the instructions.',
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

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (
      !payment.screenshotUrl &&
      payment.createdAt &&
      payment.createdAt < oneHourAgo
    ) {
      await this.paymentRepository.deletePayment(payment.id);
      throw new BadRequestException('Payment request expired and was removed.');
    }

    const { screenshotUrl } = uploadProofDto;

    const updatedPayment = await this.paymentRepository.updatePayment(
      paymentId,
      {
        screenshotUrl,
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

    const payment = await this.paymentRepository.getPaymentById(paymentId, {
      purchasedMembership: true,
    });
    if (!payment) throw new NotFoundException('Payment not found.');
    if (payment.status !== 'pending')
      throw new BadRequestException('Payment has already been processed.');
    if (status === 'rejected' && !rejectionReason)
      throw new BadRequestException('Rejection reason is required.');

    const result = await this.unitOfWork.do(async (tx) => {
      const updatedPayment = await this.paymentRepository.updatePayment(
        paymentId,
        { status, rejectionReason, verifiedBy: admin.id },
        tx,
      );

      if (status === 'approved') {
        if (payment.purchasedMembershipId && payment.purchasedMembership) {
          const plan = payment.purchasedMembership;

          await this.profileRepository.incrementProfileBenefits(
            payment.userId,
            {
              credits: plan.creditsGranted,
              checkIns: plan.checkInsGranted,
            },
            tx,
          );

          // 2. Create the UserMembership record
          const startDate = new Date();
          const endDate = new Date(
            startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
          );

          await this.userMembershipRepository.createUserMembership(
            {
              userId: payment.userId,
              membershipId: plan.id,
              paymentId: payment.id,
              startDate,
              endDate,
            },
            tx,
          );

          // 3. Log the transaction
          await this.transactionRepository.createTransaction(
            {
              userId: payment.userId,
              type: 'membership_purchase',
              amount: payment.amount, // Log the monetary value
              paymentId: payment.id,
              notes: `Purchased ${plan.name} Membership`,
            },
            tx,
          );
        } else {
          // THIS IS THE OLD LOGIC: Handle a standard credit top-up
          await this.profileRepository.updateProfileCreditsById(
            payment.userId,
            payment.amount, // Assuming 'amount' now represents credits for top-ups
            tx,
          );
          await this.transactionRepository.createTransaction(
            {
              userId: payment.userId,
              type: 'top_up',
              amount: payment.amount,
              paymentId: payment.id,
            },
            tx,
          );
        }
      }
      return updatedPayment;
    });

    // Emit events for notifications
    this.eventEmitter.emit(`payment.${status}`, {
      userId: payment.userId,
      amount: payment.amount,
      reason: rejectionReason,
    });

    return ResponseBuilder.success(result, `Payment successfully ${status}.`);
  }


  async getUserTransactionHistory(userId: string) {
    const transactions =
      await this.transactionRepository.getUserTransactions(userId);
    return ResponseBuilder.success(transactions);
  }

  async getMyPaymentHistory(user: Profile) {
    const payments = await this.paymentRepository.getUserPayments(user.id);
    return ResponseBuilder.success(payments);
  }

}
