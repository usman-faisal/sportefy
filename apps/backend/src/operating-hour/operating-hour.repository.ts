import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import {
  NewOperatingHour,
  OperatingHour,
  operatingHours,
} from '@sportefy/db-types';
import { count, eq } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

export type OperatingHoursWithInput = NonNullable<
  Parameters<DrizzleClient['query']['operatingHours']['findFirst']>[0]
>['with'];
export type OperatingHoursWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['operatingHours']['findFirst']>[0]
>['where'];
export type OperatingHoursOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['operatingHours']['findMany']>[0]
>['orderBy'];

@Injectable()
export class OperatingHourRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getOperatingHour(
    where: OperatingHoursWhereInput,
    withRelations?: OperatingHoursWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const operatingHour = await dbClient.query.operatingHours.findFirst({
      where,
      with: withRelations,
    });

    return operatingHour;
  }

  async getOperatingHourById(operatingHourId: number, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const operatingHour = await dbClient.query.operatingHours.findFirst({
      where: (operatingHours, { eq }) => eq(operatingHours.id, operatingHourId),
    });

    return operatingHour;
  }

  async getManyOperatingHours(
    where: OperatingHoursWhereInput,
    withRelations?: OperatingHoursWithInput,
    limit?: number,
    offset?: number,
    orderBy?: OperatingHoursOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const operatingHoursList = await dbClient.query.operatingHours.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return operatingHoursList;
  }

  async createOperatingHour(
    data: NewOperatingHour,
    tx?: DrizzleTransaction,
  ): Promise<OperatingHour> {
    const dbClient = tx || this.db;
    const operatingHour = await dbClient
      .insert(operatingHours)
      .values(data)
      .returning();

    return operatingHour[0];
  }

  async createManyOperatingHours(
    data: NewOperatingHour[],
    tx?: DrizzleTransaction,
  ): Promise<OperatingHour[]> {
    const dbClient = tx || this.db;
    const operatingHoursList = await dbClient
      .insert(operatingHours)
      .values(data)
      .returning();

    return operatingHoursList;
  }

  async updateOperatingHour(
    where: SqlUnknown,
    data: Partial<NewOperatingHour>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const updatedOperatingHour = await dbClient
      .update(operatingHours)
      .set(data)
      .where(where)
      .returning();

    return updatedOperatingHour;
  }

  async updateOperatingHourById(
    id: number,
    data: Partial<NewOperatingHour>,
    tx?: DrizzleTransaction,
  ) {
    return this.updateOperatingHour(eq(operatingHours.id, id), data, tx);
  }

  async deleteOperatingHour(
    where: SqlUnknown,
    tx?: DrizzleTransaction,
  ): Promise<OperatingHour[]> {
    const dbClient = tx || this.db;
    const deletedOperatingHour = await dbClient
      .delete(operatingHours)
      .where(where)
      .returning();

    return deletedOperatingHour;
  }

  async deleteOperatingHourById(id: number, tx?: DrizzleTransaction) {
    return this.deleteOperatingHour(eq(operatingHours.id, id), tx);
  }

  async count(where?: SqlUnknown, tx?: DrizzleTransaction): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(operatingHours);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
