import { forwardRef, Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { MembershipRepository } from './membership.repository';
import { PaymentModule } from 'src/payment/payment.module';
import { UserMembershipModule } from 'src/user-membership/user-membership.module';

@Module({
  imports: [forwardRef(() => PaymentModule), UserMembershipModule],
  providers: [MembershipService, MembershipRepository],
  controllers: [MembershipController],
})
export class MembershipModule {}
