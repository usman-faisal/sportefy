import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { memberships, Membership, NewMembership } from '@sportefy/db-types';
import { eq } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

export type MembershipsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['memberships']['findFirst']>[0]
>['with'];
export type MembershipsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['memberships']['findFirst']>[0]
>['where'];
export type MembershipsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['memberships']['findMany']>[0]
>['orderBy'];

@Injectable()
export class MembershipRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async createMembership(
    data: NewMembership,
    tx?: DrizzleTransaction,
  ): Promise<Membership> {
    const dbClient = tx || this.db;
    const [result] = await dbClient
      .insert(memberships)
      .values(data)
      .returning();
    return result;
  }

  async getMembership(
    where: MembershipsWhereInput,
    withRelations?: MembershipsWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient.query.memberships.findFirst({
      where,
      with: withRelations,
    });
  }

  async getMembershipById(id: string, tx?: DrizzleTransaction) {
    return this.getMembership(eq(memberships.id, id), undefined, tx);
  }

  async getMembershipByName(name: string, tx?: DrizzleTransaction) {
    return this.getMembership(eq(memberships.name, name), undefined, tx);
  }

  async getManyMemberships(
    where: MembershipsWhereInput,
    withRelations?: MembershipsWithInput,
    limit?: number,
    offset?: number,
    orderBy?: MembershipsOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient.query.memberships.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });
  }

  async getActiveMemberships(tx?: DrizzleTransaction) {
    return this.getManyMemberships(
      eq(memberships.isActive, true),
      { userMemberships: true }, // Join the user memberships data
      undefined,
      undefined,
      (memberships, { asc }) => [asc(memberships.price)], // Order by price ascending
      tx,
    );
  }

  async updateMembership(
    id: string,
    data: Partial<NewMembership>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const [result] = await dbClient
      .update(memberships)
      .set(data)
      .where(eq(memberships.id, id))
      .returning();
    return result;
  }

  async deleteMembership(id: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const [result] = await dbClient
      .delete(memberships)
      .where(eq(memberships.id, id))
      .returning();
    return result;
  }

  async deactivateMembership(id: string, tx?: DrizzleTransaction) {
    return this.updateMembership(id, { isActive: false }, tx);
  }

  async activateMembership(id: string, tx?: DrizzleTransaction) {
    return this.updateMembership(id, { isActive: true }, tx);
  }
}
