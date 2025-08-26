import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipRepository } from './membership.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { Profile } from '@sportefy/db-types';
import { PurchaseMembershipDto } from './dto/purchase-membership.dto';
import { PaymentService } from 'src/payment/payment.service';
import { UserMembershipRepository } from 'src/user-membership/user-membership.repository';

@Injectable()
export class MembershipService {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly paymentService: PaymentService,
    private readonly userMembershipRepository: UserMembershipRepository,
  ) {}

  async getAvailablePlans() {
    const plans = await this.membershipRepository.getActiveMemberships();
    return ResponseBuilder.success(plans);
  }

  async initiateMembershipPurchase(
    user: Profile,
    purchaseMembershipDto: PurchaseMembershipDto,
  ) {
    const plan = await this.membershipRepository.getMembershipById(
      purchaseMembershipDto.planId,
    );

    if (!plan) {
      throw new NotFoundException('membership not found');
    }

    // check if user already has subscription
    const existingMembership =
      await this.userMembershipRepository.getCurrentUserMembership(user.id);

    if (existingMembership) {
      throw new ConflictException('User already has an active membership');
    }

    return this.paymentService.initiateMembershipPayment(user, plan);
  }

  async getUserMembership(user: Profile) {
    const membership =
      await this.userMembershipRepository.getCurrentUserMembership(user.id);

    if (!membership) {
      throw new NotFoundException('No active membership found for user');
    }

    return ResponseBuilder.success(membership);
  }
}
