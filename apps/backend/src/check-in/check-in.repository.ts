import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewCheckIn, CheckIn, checkIns } from '@sportefy/db-types';
import { SQL, count, eq, and, isNull } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';

export type CheckInsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['checkIns']['findFirst']>[0]
>['with'];
export type CheckInsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['checkIns']['findFirst']>[0]
>['where'];
export type CheckInsUpdateWhereInput = SQL<unknown>;
export type CheckInsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['checkIns']['findMany']>[0]
>['orderBy'];

@Injectable()
export class CheckInRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) readonly db: DrizzleClient) {
    super(db);
  }

  /**
   * Finds a single check-in record based on a where clause.
   */
  async getCheckIn<TWith extends IncludeRelation<'checkIns'>>(
    where: CheckInsWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'checkIns', TWith> | undefined> {
    const dbClient = tx || this.db;
    const checkIn = await dbClient.query.checkIns.findFirst({
      where,
      with: withRelations,
    });

    return checkIn;
  }

  /**
   * Finds a single check-in record by its ID.
   */
  async getCheckInById<TWith extends IncludeRelation<'checkIns'>>(
    checkInId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'checkIns', TWith> | undefined> {
    const dbClient = tx || this.db;
    const checkIn = await dbClient.query.checkIns.findFirst({
      where: (checkIns, { eq }) => eq(checkIns.id, checkInId),
      with: withRelations,
    });

    return checkIn;
  }

  /**
   * Retrieves multiple check-in records.
   */
  async getManyCheckIns<TWith extends IncludeRelation<'checkIns'>>(
    where: CheckInsWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: CheckInsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'checkIns', TWith>[]> {
    const dbClient = tx || this.db;
    const checkInsList = await dbClient.query.checkIns.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return checkInsList;
  }

  /**
   * Creates a new check-in record.
   */
  async createCheckIn(
    data: NewCheckIn,
    tx?: DrizzleTransaction,
  ): Promise<CheckIn> {
    const dbClient = tx || this.db;
    const [checkIn] = await dbClient.insert(checkIns).values(data).returning();
    return checkIn;
  }

  /**
   * Updates check-in records matching a where clause.
   */
  async updateCheckIn(
    where: CheckInsUpdateWhereInput,
    data: Partial<NewCheckIn>,
    tx?: DrizzleTransaction,
  ): Promise<CheckIn[]> {
    const dbClient = tx || this.db;
    const updatedCheckIn = await dbClient
      .update(checkIns)
      .set(data)
      .where(where)
      .returning();

    return updatedCheckIn;
  }

  /**
   * Updates a single check-in record by its ID.
   */
  async updateCheckInById(
    id: string,
    data: Partial<NewCheckIn>,
    tx?: DrizzleTransaction,
  ): Promise<CheckIn[]> {
    return this.updateCheckIn(eq(checkIns.id, id), data, tx);
  }

  /**
   * Deletes check-in records matching a where clause.
   */
  async deleteCheckIn(
    where: CheckInsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<CheckIn[]> {
    const dbClient = tx || this.db;
    const deletedCheckIn = await dbClient
      .delete(checkIns)
      .where(where)
      .returning();
    return deletedCheckIn;
  }

  /**
   * Deletes a single check-in record by its ID.
   */
  async deleteCheckInById(
    id: string,
    tx?: DrizzleTransaction,
  ): Promise<CheckIn[]> {
    return this.deleteCheckIn(eq(checkIns.id, id), tx);
  }

  /**
   * Counts the total number of check-in records.
   */
  async count(
    where?: CheckInsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(checkIns);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }

  /**
   * Gets the count of active check-ins for a venue (checked in but not checked out).
   */
  async getActiveCheckInCount(
    venueId: string,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    const [result] = await dbClient
      .select({ count: count() })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.venueId, venueId),
          isNull(checkIns.checkOutTime)
        )
      );

    return result.count;
  }
}
