import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewUserScope, UserScope, userScopes } from '@sportefy/db-types';
import { SQL, count, eq } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

export type UserScopesWithInput = NonNullable<
  Parameters<DrizzleClient['query']['userScopes']['findFirst']>[0]
>['with'];
export type UserScopesWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['userScopes']['findFirst']>[0]
>['where'];
export type UserScopesOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['userScopes']['findMany']>[0]
>['orderBy'];

@Injectable()
export class UserScopeRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getUserScope(
    where: UserScopesWhereInput,
    withRelations?: UserScopesWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const userScope = await dbClient.query.userScopes.findFirst({
      where,
      with: withRelations,
    });

    return userScope;
  }

  async getUserScopeById(userScopeId: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const userScope = await dbClient.query.userScopes.findFirst({
      where: (userScopes, { eq }) => eq(userScopes.id, userScopeId),
    });

    return userScope;
  }

  async getManyUserScopes(
    where: UserScopesWhereInput,
    withRelations?: UserScopesWithInput,
    limit?: number,
    offset?: number,
    orderBy?: UserScopesOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const userScopesList = await dbClient.query.userScopes.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return userScopesList;
  }

  async createUserScope(
    data: NewUserScope,
    tx?: DrizzleTransaction,
  ): Promise<UserScope> {
    const dbClient = tx || this.db;
    const userScope = await dbClient
      .insert(userScopes)
      .values(data)
      .returning();

    return userScope[0];
  }

  async updateUserScope(
    where: SqlUnknown,
    data: Partial<NewUserScope>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const updatedUserScope = await dbClient
      .update(userScopes)
      .set(data)
      .where(where)
      .returning();

    return updatedUserScope;
  }

  async updateUserScopeById(
    id: string,
    data: Partial<NewUserScope>,
    tx?: DrizzleTransaction,
  ) {
    return this.updateUserScope(eq(userScopes.id, id), data, tx);
  }

  async deleteUserScope(
    where: SqlUnknown,
    tx?: DrizzleTransaction,
  ): Promise<UserScope[]> {
    const dbClient = tx || this.db;
    const deletedUserScope = await dbClient
      .delete(userScopes)
      .where(where)
      .returning();

    return deletedUserScope;
  }

  async deleteUserScopeById(id: string, tx?: DrizzleTransaction) {
    return this.deleteUserScope(eq(userScopes.id, id), tx);
  }

  async count(where?: SqlUnknown, tx?: DrizzleTransaction): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(userScopes);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
