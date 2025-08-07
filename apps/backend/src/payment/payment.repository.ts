import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { payments, Payment, NewPayment } from '@sportefy/db-types';
import { eq } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

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

  async getPaymentById(id: string, tx?: DrizzleTransaction) {
    return this.getPayment(eq(payments.id, id), undefined, tx);
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
}