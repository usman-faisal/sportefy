import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { payments, Payment, NewPayment } from '@sportefy/db-types';
import { and, eq, isNull, lt, gt } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';

export type PaymentsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['payments']['findFirst']>[0]
>['with'];
export type PaymentsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['payments']['findFirst']>[0]
>['where'];
export type PaymentsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['payments']['findMany']>[0]
>['orderBy'];

@Injectable()
export class PaymentRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async createPayment(
    data: NewPayment,
    tx?: DrizzleTransaction,
  ): Promise<Payment> {
    const dbClient = tx || this.db;
    const [result] = await dbClient.insert(payments).values(data).returning();
    return result;
  }

  async getPayment(
    where: PaymentsWhereInput,
    withRelations?: PaymentsWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient.query.payments.findFirst({
      where,
      with: withRelations,
    });
  }

  async getPaymentById<TWith extends IncludeRelation<'payments'>>(
    id: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'payments', TWith> | undefined> {
    const dbClient = tx || this.db;
    return dbClient.query.payments.findFirst({
      where: eq(payments.id, id),
      with: withRelations,
    }) as Promise<InferResultType<'payments', TWith> | undefined>;
  }

  async getManyPayments(
    where: PaymentsWhereInput,
    withRelations?: PaymentsWithInput,
    limit?: number,
    offset?: number,
    orderBy?: PaymentsOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient.query.payments.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });
  }

  async getPendingPayments(tx?: DrizzleTransaction) {
    return this.getManyPayments(
      eq(payments.status, 'pending'),
      { user: true }, // This is how we join the user/profile data
      undefined,
      undefined,
      (payments, { desc }) => [desc(payments.createdAt)],
      tx,
    );
  }

  /**
   * Returns an active pending payment for the user that has not yet expired.
   * A pending payment is considered active if it has status 'pending', no screenshot uploaded,
   * and createdAt is within the provided threshold window.
   */
  async getActivePendingPaymentForUser(
    userId: string,
    thresholdDate: Date,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient.query.payments.findFirst({
      where: and(
        eq(payments.userId, userId),
        eq(payments.status, 'pending'),
        isNull(payments.screenshotUrl),
        gt(payments.createdAt, thresholdDate),
      ),
    });
  }

  async deletePayment(id: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const [result] = await dbClient
      .delete(payments)
      .where(eq(payments.id, id))
      .returning();
    return result;
  }

  async deleteExpiredPendingPayments(thresholdDate: Date, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const deleted = await dbClient
      .delete(payments)
      .where(
        and(
          eq(payments.status, 'pending'),
          isNull(payments.screenshotUrl),
          lt(payments.createdAt, thresholdDate),
        ),
      )
      .returning();
    return deleted.length;
  }

  async updatePayment(
    id: string,
    data: Partial<NewPayment>,
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

  async getUserPayments(userId: string, tx?: DrizzleTransaction) {
    return this.getManyPayments(
      eq(payments.userId, userId),
      { purchasedMembership: true }, // Include membership details if applicable
      undefined,
      undefined,
      (payments, { desc }) => [desc(payments.createdAt)],
      tx,
    );
  }
}
