import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewVenueSport, VenueSport, venueSports } from '@sportefy/db-types';
import { SQL, and, count, eq } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';

export type VenueSportsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['venueSports']['findFirst']>[0]
>['with'];
export type VenueSportsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['venueSports']['findFirst']>[0]
>['where'];
export type VenueSportsUpdateWhereInput = SQL<unknown> | undefined;
export type VenueSportsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['venueSports']['findMany']>[0]
>['orderBy'];

@Injectable()
export class VenueSportRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) readonly db: DrizzleClient) {
    super(db);
  }

  async getVenueSport<TWith extends IncludeRelation<'venueSports'>>(
    where: VenueSportsWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'venueSports', TWith> | undefined> {
    const dbClient = tx || this.db;
    const venueSport = await dbClient.query.venueSports.findFirst({
      where,
      with: withRelations,
    });

    return venueSport;
  }

  async getVenueSportByIds<TWith extends IncludeRelation<'venueSports'>>(
    venueId: string,
    sportId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'venueSports', TWith> | undefined> {
    const dbClient = tx || this.db;
    const venueSport = await dbClient.query.venueSports.findFirst({
      where: (venueSports, { eq, and }) =>
        and(eq(venueSports.venueId, venueId), eq(venueSports.sportId, sportId)),
      with: withRelations,
    });

    return venueSport;
  }

  async getVenueSportsByVenueId<TWith extends IncludeRelation<'venueSports'>>(
    venueId: string,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: VenueSportsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'venueSports', TWith>[]> {
    const dbClient = tx || this.db;
    const venueSportsList = await dbClient.query.venueSports.findMany({
      where: (venueSports, { eq }) => eq(venueSports.venueId, venueId),
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return venueSportsList;
  }

  async getVenueSportsBySportId<TWith extends IncludeRelation<'venueSports'>>(
    sportId: string,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: VenueSportsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'venueSports', TWith>[]> {
    const dbClient = tx || this.db;
    const venueSportsList = await dbClient.query.venueSports.findMany({
      where: (venueSports, { eq }) => eq(venueSports.sportId, sportId),
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return venueSportsList;
  }

  async getManyVenueSports<TWith extends IncludeRelation<'venueSports'>>(
    where?: VenueSportsWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: VenueSportsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'venueSports', TWith>[]> {
    const dbClient = tx || this.db;
    const venueSportsList = await dbClient.query.venueSports.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return venueSportsList;
  }

  async createVenueSport(
    data: NewVenueSport,
    tx?: DrizzleTransaction,
  ): Promise<VenueSport> {
    const dbClient = tx || this.db;
    const venueSport = await dbClient
      .insert(venueSports)
      .values(data)
      .returning();
    return venueSport[0];
  }

  async createManyVenueSports(
    data: NewVenueSport[],
    tx?: DrizzleTransaction,
  ): Promise<VenueSport[]> {
    const dbClient = tx || this.db;
    const venueSportsList = await dbClient
      .insert(venueSports)
      .values(data)
      .returning();
    return venueSportsList;
  }

  async updateVenueSport(
    where: VenueSportsUpdateWhereInput,
    data: Partial<NewVenueSport>,
    tx?: DrizzleTransaction,
  ): Promise<VenueSport[]> {
    const dbClient = tx || this.db;
    const updatedVenueSport = await dbClient
      .update(venueSports)
      .set(data)
      .where(where)
      .returning();

    return updatedVenueSport;
  }

  async updateVenueSportByIds(
    venueId: string,
    sportId: string,
    data: Partial<NewVenueSport>,
    tx?: DrizzleTransaction,
  ): Promise<VenueSport[]> {
    return this.updateVenueSport(
      and(eq(venueSports.venueId, venueId), eq(venueSports.sportId, sportId)),
      data,
      tx,
    );
  }

  async deleteVenueSport(
    where: VenueSportsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<VenueSport[]> {
    const dbClient = tx || this.db;
    const deletedVenueSport = await dbClient
      .delete(venueSports)
      .where(where)
      .returning();

    return deletedVenueSport;
  }

  async deleteVenueSportByIds(
    venueId: string,
    sportId: string,
    tx?: DrizzleTransaction,
  ): Promise<VenueSport[]> {
    return this.deleteVenueSport(
      and(eq(venueSports.venueId, venueId), eq(venueSports.sportId, sportId)),
      tx,
    );
  }

  async deleteAllVenueSportsByVenueId(
    venueId: string,
    tx?: DrizzleTransaction,
  ): Promise<VenueSport[]> {
    return this.deleteVenueSport(eq(venueSports.venueId, venueId), tx);
  }

  async deleteAllVenueSportsBySportId(
    sportId: string,
    tx?: DrizzleTransaction,
  ): Promise<VenueSport[]> {
    return this.deleteVenueSport(eq(venueSports.sportId, sportId), tx);
  }

  async count(
    where?: VenueSportsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(venueSports);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }

  async countByVenueId(
    venueId: string,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    return this.count(eq(venueSports.venueId, venueId), tx);
  }

  async countBySportId(
    sportId: string,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    return this.count(eq(venueSports.sportId, sportId), tx);
  }

  async existsVenueSport(
    venueId: string,
    sportId: string,
    tx?: DrizzleTransaction,
  ): Promise<boolean> {
    const venueSport = await this.getVenueSportByIds(
      venueId,
      sportId,
      undefined,
      tx,
    );
    return !!venueSport;
  }
}
