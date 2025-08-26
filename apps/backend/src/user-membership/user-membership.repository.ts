import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import {
  userMemberships,
  UserMembership,
  NewUserMembership,
} from '@sportefy/db-types';
import { eq, and, gte, lte } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

export type UserMembershipsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['userMemberships']['findFirst']>[0]
>['with'];
export type UserMembershipsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['userMemberships']['findFirst']>[0]
>['where'];
export type UserMembershipsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['userMemberships']['findMany']>[0]
>['orderBy'];

@Injectable()
export class UserMembershipRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async createUserMembership(
    data: NewUserMembership,
    tx?: DrizzleTransaction,
  ): Promise<UserMembership> {
    const dbClient = tx || this.db;
    const [result] = await dbClient
      .insert(userMemberships)
      .values(data)
      .returning();
    return result;
  }

  async getUserMembership(
    where: UserMembershipsWhereInput,
    withRelations?: UserMembershipsWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient.query.userMemberships.findFirst({
      where,
      with: withRelations,
    });
  }

  async getUserMembershipById(id: string, tx?: DrizzleTransaction) {
    return this.getUserMembership(eq(userMemberships.id, id), undefined, tx);
  }

  async getUserMembershipByPaymentId(
    paymentId: string,
    tx?: DrizzleTransaction,
  ) {
    return this.getUserMembership(
      eq(userMemberships.paymentId, paymentId),
      { user: true, membership: true, payment: true },
      tx,
    );
  }

  async getManyUserMemberships(
    where: UserMembershipsWhereInput,
    withRelations?: UserMembershipsWithInput,
    limit?: number,
    offset?: number,
    orderBy?: UserMembershipsOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient.query.userMemberships.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });
  }

  async getUserMembershipsByUserId(
    userId: string,
    withRelations?: UserMembershipsWithInput,
    tx?: DrizzleTransaction,
  ) {
    return this.getManyUserMemberships(
      eq(userMemberships.userId, userId),
      withRelations || { membership: true, payment: true },
      undefined,
      undefined,
      (userMemberships, { desc }) => [desc(userMemberships.createdAt)],
      tx,
    );
  }

  async getActiveUserMembershipsByUserId(
    userId: string,
    tx?: DrizzleTransaction,
  ) {
    const now = new Date();
    return this.getManyUserMemberships(
      and(
        eq(userMemberships.userId, userId),
        eq(userMemberships.isActive, true),
        lte(userMemberships.startDate, now),
        gte(userMemberships.endDate, now),
      ),
      { membership: true, payment: true },
      undefined,
      undefined,
      (userMemberships, { desc }) => [desc(userMemberships.endDate)],
      tx,
    );
  }

  async getCurrentUserMembership(userId: string, tx?: DrizzleTransaction) {
    const now = new Date();
    return this.getUserMembership(
      and(
        eq(userMemberships.userId, userId),
        eq(userMemberships.isActive, true),
        lte(userMemberships.startDate, now),
        gte(userMemberships.endDate, now),
      ),
      { membership: true, payment: true },
      tx,
    );
  }

  async getExpiredUserMemberships(tx?: DrizzleTransaction) {
    const now = new Date();
    return this.getManyUserMemberships(
      and(
        eq(userMemberships.isActive, true),
        lte(userMemberships.endDate, now),
      ),
      { user: true, membership: true },
      undefined,
      undefined,
      (userMemberships, { asc }) => [asc(userMemberships.endDate)],
      tx,
    );
  }

  async updateUserMembership(
    id: string,
    data: Partial<NewUserMembership>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const [result] = await dbClient
      .update(userMemberships)
      .set(data)
      .where(eq(userMemberships.id, id))
      .returning();
    return result;
  }

  async deactivateUserMembership(id: string, tx?: DrizzleTransaction) {
    return this.updateUserMembership(id, { isActive: false }, tx);
  }

  async activateUserMembership(id: string, tx?: DrizzleTransaction) {
    return this.updateUserMembership(id, { isActive: true }, tx);
  }

  async extendUserMembership(
    id: string,
    newEndDate: Date,
    tx?: DrizzleTransaction,
  ) {
    return this.updateUserMembership(id, { endDate: newEndDate }, tx);
  }
}
