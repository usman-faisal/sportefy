import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { ProfileModule } from 'src/profile/profile.module';
import { CreditController } from './credit.controller';

@Module({
  imports: [TransactionModule, ProfileModule],
  providers: [CreditService],
  exports: [CreditService],
  controllers: [CreditController],
})
export class CreditModule {}
