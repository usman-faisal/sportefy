import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { facilities, Facility, NewFacility } from '@sportefy/db-types';
import { SQL, count, eq } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

export type FacilitiesWithInput = NonNullable<
  Parameters<DrizzleClient['query']['facilities']['findFirst']>[0]
>['with'];
export type FacilitiesWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['facilities']['findFirst']>[0]
>['where'];
export type FacilitiesOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['facilities']['findMany']>[0]
>['orderBy'];

@Injectable()
export class FacilityRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getFacility(
    where: FacilitiesWhereInput,
    withRelations?: FacilitiesWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const facility = await dbClient.query.facilities.findFirst({
      where,
      with: withRelations,
    });

    return facility;
  }

  async getFacilityById(facilityId: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const facility = await dbClient.query.facilities.findFirst({
      where: (facilities, { eq }) => eq(facilities.id, facilityId),
    });

    return facility;
  }

  async getManyFacilities(
    where: FacilitiesWhereInput,
    withRelations?: FacilitiesWithInput,
    limit?: number,
    offset?: number,
    orderBy?: FacilitiesOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const facilitiesList = await dbClient.query.facilities.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return facilitiesList;
  }

  async createFacility(
    data: NewFacility,
    tx?: DrizzleTransaction,
  ): Promise<Facility> {
    const dbClient = tx || this.db;
    const facility = await dbClient.insert(facilities).values(data).returning();

    return facility[0];
  }

  async updateFacility(
    where: SqlUnknown,
    data: Partial<NewFacility>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const updatedFacility = await dbClient
      .update(facilities)
      .set(data)
      .where(where)
      .returning();

    return updatedFacility;
  }

  async updateFacilityById(
    id: string,
    data: Partial<NewFacility>,
    tx?: DrizzleTransaction,
  ) {
    return this.updateFacility(eq(facilities.id, id), data, tx);
  }

  async deleteFacility(
    where: SqlUnknown,
    tx?: DrizzleTransaction,
  ): Promise<Facility[]> {
    const dbClient = tx || this.db;
    const deletedFacility = await dbClient
      .delete(facilities)
      .where(where)
      .returning();

    return deletedFacility;
  }

  async deleteFacilityById(id: string, tx?: DrizzleTransaction) {
    return this.deleteFacility(eq(facilities.id, id), tx);
  }

  async count(where?: SqlUnknown, tx?: DrizzleTransaction): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(facilities);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
