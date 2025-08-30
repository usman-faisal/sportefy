import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MatchType, PaymentSplitType } from 'src/common/types';
import { Profile, profiles } from '@sportefy/db-types';
import { TransactionRepository } from 'src/transaction/transaction.repository';
import { TransferCreditsDto } from './dto/transfer-credits.dto';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { ProfileRepository } from 'src/profile/profile.repository';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';
import { eq } from 'drizzle-orm';

@Injectable()
export class CreditService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly unitOfWork: UnitOfWork,
  ) { }
  /**
   * Calculates the number of credits to charge or refund for a single spot in a match.
   *
   * @param matchType The type of the match ('public' or 'private').
   * @param splitType The payment structure for a private match.
   * @param basePrice The total credit cost of the booking.
   * @param playerLimit The maximum number of players for the match.
   * @param isCreator A boolean indicating if the user is the one who created the booking.
   * @returns The number of credits to charge a single user.
   */
  calculatePerPlayerCharge(
    matchType: MatchType,
    splitType: PaymentSplitType | null,
    basePrice: number,
    playerLimit: number,
    isCreator: boolean = false,
  ): number {
    if (
      matchType === MatchType.PUBLIC ||
      splitType === PaymentSplitType.SPLIT_EVENLY
    ) {
      if (playerLimit === 0) return 0;
      return Math.round(basePrice / playerLimit);
    }

    if (splitType === PaymentSplitType.CREATOR_PAYS_ALL) {
      return isCreator ? basePrice : 0;
    }

    throw new InternalServerErrorException(
      'Invalid payment configuration for private match.',
    );
  }

  async transferCredits(sender: Profile, dto: TransferCreditsDto) {
    const { recipientEmail, amount, notes } = dto;

    // 1. Pre-flight validations
    if (sender.email === recipientEmail) {
      throw new BadRequestException('You cannot transfer credits to yourself.');
    }
    if (sender.credits && sender.credits < amount) {
      throw new BadRequestException('Insufficient credits for this transfer.');
    }

    // 2. Find the recipient
    const recipient = await this.profileRepository.getProfile(
      eq(profiles.email, recipientEmail),
    );

    if (!recipient) {
      throw new NotFoundException('Recipient user not found.');
    }

    // 3. Execute the transfer within a database transaction
    await this.unitOfWork.do(async (tx) => {
      // Debit the sender
      await this.profileRepository.updateProfileCreditsById(
        sender.id,
        -amount,
        tx,
      );

      // Credit the recipient
      await this.profileRepository.updateProfileCreditsById(
        recipient.id,
        amount,
        tx,
      );

      // Log transaction for the sender
      await this.transactionRepository.createTransaction(
        {
          userId: sender.id,
          type: 'transfer_out',
          amount: -amount,
          senderId: sender.id,
          receiverId: recipient.id,
          notes:
            notes || `Transfer to ${recipient.fullName || recipient.email}`,
        },
        tx,
      );

      // Log transaction for the recipient
      await this.transactionRepository.createTransaction(
        {
          userId: recipient.id,
          type: 'transfer_in',
          amount: amount,
          senderId: sender.id,
          receiverId: recipient.id,
          notes: notes || `Transfer from ${sender.fullName || sender.email}`,
        },
        tx,
      );
    });

    // 4. Return success response
    // Future: Emit an event here for real-time notifications
    return ResponseBuilder.success(
      null,
      `Successfully transferred ${amount} credits to ${recipient.email}.`,
    );
  }
}
