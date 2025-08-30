import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { ProfileModule } from 'src/profile/profile.module'; // Import to use ProfileRepository
import { TransactionModule } from 'src/transaction/transaction.module';
import { MembershipModule } from 'src/membership/membership.module';
import { UserMembershipModule } from 'src/user-membership/user-membership.module';
import { PaymentSchedulerService } from './payment.scheduler.service';

@Module({
  imports: [
    ProfileModule,
    TransactionModule,
    forwardRef(() => MembershipModule),
    UserMembershipModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, PaymentSchedulerService],
  exports: [PaymentService],
})
export class PaymentModule {}
