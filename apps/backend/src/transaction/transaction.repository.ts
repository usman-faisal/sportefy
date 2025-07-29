import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewTransaction, Transaction, transactions } from '@sportefy/db-types';
import { SQL, count, eq } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';

// Define reusable types for query inputs, mirroring your other repositories
export type TransactionsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['transactions']['findFirst']>[0]
>['with'];
export type TransactionsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['transactions']['findFirst']>[0]
>['where'];
export type TransactionsUpdateWhereInput = SQL<unknown>;
export type TransactionsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['transactions']['findMany']>[0]
>['orderBy'];

@Injectable()
export class TransactionRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) readonly db: DrizzleClient) {
    super(db);
  }

  /**
   * Creates a new transaction record.
   * This is the most common write operation for this repository.
   * @param data The data for the new transaction.
   * @param tx An optional database transaction client.
   * @returns The newly created transaction.
   */
  async createTransaction(
    data: NewTransaction,
    tx?: DrizzleTransaction,
  ): Promise<Transaction> {
    const dbClient = tx || this.db;
    const [newTransaction] = await dbClient
      .insert(transactions)
      .values(data)
      .returning();
    return newTransaction;
  }

  /**
   * Retrieves a single transaction based on a where condition.
   * @param where The SQL where condition.
   * @param withRelations Optional relations to include.
   * @param tx An optional database transaction client.
   * @returns A single transaction or undefined if not found.
   */
  async getTransaction<TWith extends IncludeRelation<'transactions'>>(
    where: TransactionsWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'transactions', TWith> | undefined> {
    const dbClient = tx || this.db;
    return dbClient.query.transactions.findFirst({
      where,
      with: withRelations,
    });
  }

  /**
   * Retrieves a list of transactions for a specific user.
   * @param userId The ID of the user.
   * @param limit The maximum number of transactions to return.
   * @param offset The number of transactions to skip (for pagination).
   * @returns An array of the user's transactions.
   */
  async getUserTransactions(
    userId: string,
    limit = 20,
    offset = 0,
    tx?: DrizzleTransaction,
  ): Promise<Transaction[]> {
    const dbClient = tx || this.db;
    return dbClient.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
      limit,
      offset,
    });
  }

  /**
   * Retrieves multiple transactions based on a where condition.
   * @param where The SQL where condition.
   * @param withRelations Optional relations to include.
   * @param limit The maximum number of records to return.
   * @param offset The number of records to skip.
   * @param orderBy The order to sort the results by.
   * @param tx An optional database transaction client.
   * @returns An array of transactions.
   */
  async getManyTransactions<TWith extends IncludeRelation<'transactions'>>(
    where: TransactionsWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: TransactionsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'transactions', TWith>[]> {
    const dbClient = tx || this.db;
    return dbClient.query.transactions.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });
  }

  /**
   * Counts the total number of transactions, optionally filtered by a where condition.
   * @param where The SQL where condition.
   * @param tx An optional database transaction client.
   * @returns The total count of transactions.
   */
  async count(where?: SqlUnknown, tx?: DrizzleTransaction): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(transactions);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
