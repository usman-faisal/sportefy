import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewUser, User, users } from '@sportefy/db-types';
import { SQL, count, eq } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

export type UsersWithInput = NonNullable<
  Parameters<DrizzleClient['query']['users']['findFirst']>[0]
>['with'];
export type UsersWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['users']['findFirst']>[0]
>['where'];
export type UsersOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['users']['findMany']>[0]
>['orderBy'];

@Injectable()
export class UserRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getUser(
    where: UsersWhereInput,
    withRelations?: UsersWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const user = await dbClient.query.users.findFirst({
      where,
      with: withRelations,
    });

    return user;
  }

  async getUserById(userId: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const user = await dbClient.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    return user;
  }

  async getManyUsers(
    where: UsersWhereInput,
    withRelations?: UsersWithInput,
    limit?: number,
    offset?: number,
    orderBy?: UsersOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const usersList = await dbClient.query.users.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return usersList;
  }

  async createUser(data: NewUser, tx?: DrizzleTransaction): Promise<User> {
    const dbClient = tx || this.db;
    const user = await dbClient.insert(users).values(data).returning();

    return user[0];
  }

  async updateUser(
    where: SqlUnknown,
    data: Partial<NewUser>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const updatedUser = await dbClient
      .update(users)
      .set(data)
      .where(where)
      .returning();

    return updatedUser;
  }

  async updateUserById(
    id: string,
    data: Partial<NewUser>,
    tx?: DrizzleTransaction,
  ) {
    return this.updateUser(eq(users.id, id), data, tx);
  }

  async deleteUser(
    where: SqlUnknown,
    tx?: DrizzleTransaction,
  ): Promise<User[]> {
    const dbClient = tx || this.db;
    const deletedUser = await dbClient.delete(users).where(where).returning();

    return deletedUser;
  }

  async deleteUserById(id: string, tx?: DrizzleTransaction) {
    return this.deleteUser(eq(users.id, id), tx);
  }

  async count(where?: SqlUnknown, tx?: DrizzleTransaction): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(users);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
