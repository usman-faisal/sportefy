import { Injectable } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { Profile } from '@sportefy/db-types';

@Injectable()
export class TransactionService {
    constructor(private readonly transactionRepository: TransactionRepository) { }
    async getMyTransactionHistory(user: Profile) {
        const history = await this.transactionRepository.getUserTransactions(
            user.id,
        );
        return ResponseBuilder.success(history);
    }
}
