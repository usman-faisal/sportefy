import { Module } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  providers: [TransactionRepository, TransactionService],
  exports: [TransactionRepository],
  controllers: [TransactionController],
})
export class TransactionModule { }
