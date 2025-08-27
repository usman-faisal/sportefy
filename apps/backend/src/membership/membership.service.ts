import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipRepository } from './membership.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { Profile } from '@sportefy/db-types';
import { PurchaseMembershipDto } from './dto/purchase-membership.dto';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
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

  async getAllMemberships() {
    const plans = await this.membershipRepository.getManyMemberships(undefined);
    return ResponseBuilder.success(plans);
  }

  async getMembershipById(id: string) {
    const plan = await this.membershipRepository.getMembershipById(id);
    if (!plan) {
      throw new NotFoundException('membership not found');
    }
    return ResponseBuilder.success(plan);
  }

  async createMembership(dto: CreateMembershipDto) {
    // using explicit shape rather than type import to avoid circular deps in this file edit
    const existing = await this.membershipRepository.getMembershipByName(dto.name);
    if (existing) {
      throw new ConflictException('Membership with this name already exists');
    }

    const created = await this.membershipRepository.createMembership({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      creditsGranted: dto.creditsGranted ?? 0,
      checkInsGranted: dto.checkInsGranted ?? 0,
      durationDays: dto.durationDays,
      isActive: dto.isActive ?? true,
    });

    return ResponseBuilder.success(created, 'Membership created');
  }

  async updateMembership(id: string, dto: UpdateMembershipDto) {
    const existing = await this.membershipRepository.getMembershipById(id);
    if (!existing) {
      throw new NotFoundException('membership not found');
    }

    if (dto.name && dto.name !== existing.name) {
      const nameExists = await this.membershipRepository.getMembershipByName(
        dto.name,
      );
      if (nameExists) {
        throw new ConflictException('Membership with this name already exists');
      }
    }

    const updated = await this.membershipRepository.updateMembership(id, {
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
      price: dto.price ?? existing.price,
      creditsGranted: dto.creditsGranted ?? existing.creditsGranted,
      checkInsGranted: dto.checkInsGranted ?? existing.checkInsGranted,
      durationDays: dto.durationDays ?? existing.durationDays,
      isActive: dto.isActive ?? existing.isActive,
      updatedAt: new Date(),
    });

    return ResponseBuilder.success(updated, 'Membership updated');
  }

  async deleteMembership(id: string) {
    const existing = await this.membershipRepository.getMembershipById(id);
    if (!existing) {
      throw new NotFoundException('membership not found');
    }

    const deleted = await this.membershipRepository.deleteMembership(id);
    return ResponseBuilder.success(deleted, 'Membership deleted');
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
