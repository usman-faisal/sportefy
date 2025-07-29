import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import {
  NewMaintenanceSchedule,
  MaintenanceSchedule,
  maintenanceSchedules,
  Slot,
} from '@sportefy/db-types';
import { count, eq } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';

export type MaintenanceSchedulesWithInput = NonNullable<
  Parameters<DrizzleClient['query']['maintenanceSchedules']['findFirst']>[0]
>['with'];
export type MaintenanceSchedulesWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['maintenanceSchedules']['findFirst']>[0]
>['where'];
export type MaintenanceSchedulesOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['maintenanceSchedules']['findMany']>[0]
>['orderBy'];

@Injectable()
export class MaintenanceScheduleRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getMaintenanceSchedule<
    TWith extends IncludeRelation<'maintenanceSchedules'>,
  >(
    where: MaintenanceSchedulesWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'maintenanceSchedules', TWith> | undefined> {
    const dbClient = tx || this.db;
    const schedule = await dbClient.query.maintenanceSchedules.findFirst({
      where,
      with: withRelations,
    });

    return schedule;
  }

  async getMaintenanceScheduleById<
    TWith extends IncludeRelation<'maintenanceSchedules'>,
  >(
    scheduleId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'maintenanceSchedules', TWith> | undefined> {
    const dbClient = tx || this.db;
    const schedule = await dbClient.query.maintenanceSchedules.findFirst({
      where: (maintenanceSchedules, { eq }) =>
        eq(maintenanceSchedules.id, scheduleId),
      with: withRelations,
    });

    return schedule;
  }

  async getManyMaintenanceSchedules<
    TWith extends IncludeRelation<'maintenanceSchedules'>,
  >(
    where: MaintenanceSchedulesWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: MaintenanceSchedulesOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'maintenanceSchedules', TWith>[]> {
    const dbClient = tx || this.db;
    const schedulesList = await dbClient.query.maintenanceSchedules.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return schedulesList;
  }

  async createMaintenanceSchedule(
    data: NewMaintenanceSchedule,
    tx?: DrizzleTransaction,
  ): Promise<MaintenanceSchedule> {
    const dbClient = tx || this.db;
    const schedule = await dbClient
      .insert(maintenanceSchedules)
      .values(data)
      .returning();

    return schedule[0];
  }

  async updateMaintenanceSchedule(
    where: SqlUnknown,
    data: Partial<NewMaintenanceSchedule>,
    tx?: DrizzleTransaction,
  ): Promise<MaintenanceSchedule[]> {
    const dbClient = tx || this.db;
    const updatedSchedule = await dbClient
      .update(maintenanceSchedules)
      .set(data)
      .where(where)
      .returning();

    return updatedSchedule;
  }

  async updateMaintenanceScheduleById(
    id: string,
    data: Partial<NewMaintenanceSchedule>,
    tx?: DrizzleTransaction,
  ): Promise<MaintenanceSchedule[]> {
    return this.updateMaintenanceSchedule(
      eq(maintenanceSchedules.id, id),
      data,
      tx,
    );
  }

  async deleteMaintenanceSchedule(
    where: SqlUnknown,
    tx?: DrizzleTransaction,
  ): Promise<MaintenanceSchedule[]> {
    const dbClient = tx || this.db;
    const deletedSchedule = await dbClient
      .delete(maintenanceSchedules)
      .where(where)
      .returning();

    return deletedSchedule;
  }

  async deleteMaintenanceScheduleById(
    id: string,
    tx?: DrizzleTransaction,
  ): Promise<MaintenanceSchedule[]> {
    return this.deleteMaintenanceSchedule(eq(maintenanceSchedules.id, id), tx);
  }

  async count(where?: SqlUnknown, tx?: DrizzleTransaction): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient
      .select({ count: count() })
      .from(maintenanceSchedules);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
