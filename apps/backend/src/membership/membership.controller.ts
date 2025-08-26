import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/types';
import { MembershipService } from './membership.service';
import { PurchaseMembershipDto } from './dto/purchase-membership.dto';
import { Profile } from '@sportefy/db-types';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('memberships')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}
  @Auth(UserRole.USER, UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all available membership plans' })
  getAvailablePlans() {
    return this.membershipService.getAvailablePlans();
  }

  @Auth(UserRole.USER)
  @Post('purchase')
  @ApiOperation({ summary: 'Initiate the purchase of a membership' })
  @ApiBody({ type: PurchaseMembershipDto })
  purchaseMembership(
    @CurrentUser() user: Profile,
    @Body() purchaseDto: PurchaseMembershipDto,
  ) {
    return this.membershipService.initiateMembershipPurchase(user, purchaseDto);
  }

  @Auth(UserRole.USER)
  @Get('current')
  @ApiOperation({ summary: 'Get current user membership' })
  getCurrentUserMembership(@CurrentUser() user: Profile) {
    return this.membershipService.getUserMembership(user);
  }
}
