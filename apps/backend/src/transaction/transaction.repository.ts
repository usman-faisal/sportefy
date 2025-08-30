import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { transactions, Transaction, NewTransaction } from '@sportefy/db-types';
import { eq } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

export type TransactionsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['transactions']['findFirst']>[0]
>['with'];
export type TransactionsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['transactions']['findFirst']>[0]
>['where'];
export type TransactionsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['transactions']['findMany']>[0]
>['orderBy'];

@Injectable()
export class TransactionRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async createTransaction(
    data: NewTransaction,
    tx?: DrizzleTransaction,
  ): Promise<Transaction> {
    const dbClient = tx || this.db;
    const [result] = await dbClient.insert(transactions).values(data).returning();
    return result;
  }

  async getManyTransactions(
    where: TransactionsWhereInput,
    withRelations?: TransactionsWithInput,
    limit?: number,
    offset?: number,
    orderBy?: TransactionsOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient.query.transactions.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });
  }

  async getUserTransactions(userId: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    return dbClient.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      with: {
        booking: true,
        payment: true,
        sender: { columns: { fullName: true, avatarUrl: true, email: true } },
        receiver: { columns: { fullName: true, avatarUrl: true, email: true } }

      },
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
    });
  }
}