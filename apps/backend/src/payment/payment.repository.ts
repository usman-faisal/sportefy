// src/payment/payment.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { SQL, eq } from 'drizzle-orm';
import { BaseRepository } from 'src/common/base.repository';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { payments, transactions } from '@sportefy/db-types';
import { DrizzleTransaction } from 'src/database/types';

@Injectable()
export class PaymentRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async createPayment(
    data: typeof payments.$inferInsert,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const [result] = await dbClient.insert(payments).values(data).returning();
    return result;
  }

  async getPaymentById(id: string) {
    const [result] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    return result;
  }

  async getPendingPayments() {
    return this.db
      .select()
      .from(payments)
      .where(eq(payments.status, 'pending'));
  }

  async updatePayment(
    id: string,
    data: Partial<typeof payments.$inferSelect>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const [result] = await dbClient
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return result;
  }

  async createTransaction(
    data: typeof transactions.$inferInsert,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const [result] = await dbClient
      .insert(transactions)
      .values(data)
      .returning();
    return result;
  }

  async getUserTransactions(userId: string, limit = 10) {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt)
      .limit(limit);
  }
}
