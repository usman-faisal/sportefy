import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { ProfileModule } from 'src/profile/profile.module'; // Import to use ProfileRepository
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [ProfileModule, TransactionModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
