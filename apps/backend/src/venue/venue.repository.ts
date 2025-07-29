import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewVenue, Venue, venues } from '@sportefy/db-types';
import { SQL, and, count, eq } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';
import { sports, venueSports } from '@sportefy/db-types';

export type VenuesWithInput = NonNullable<
  Parameters<DrizzleClient['query']['venues']['findFirst']>[0]
>['with'];
export type VenuesWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['venues']['findFirst']>[0]
>['where'];
export type VenuesUpdateWhereInput = SQL<unknown>;
export type VenuesOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['venues']['findMany']>[0]
>['orderBy'];

@Injectable()
export class VenueRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) readonly db: DrizzleClient) {
    super(db);
  }

  async getVenue<TWith extends IncludeRelation<'venues'>>(
    where: VenuesWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'venues', TWith> | undefined> {
    const dbClient = tx || this.db;
    const venue = await dbClient.query.venues.findFirst({
      where,
      with: withRelations,
    });

    return venue;
  }

  async getVenueById<TWith extends IncludeRelation<'venues'>>(
    venueId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'venues', TWith> | undefined> {
    const dbClient = tx || this.db;
    const venue = await dbClient.query.venues.findFirst({
      where: (venues, { eq }) => eq(venues.id, venueId),
      with: withRelations,
    });

    return venue;
  }

  async getManyVenues<TWith extends IncludeRelation<'venues'>>(
    where: VenuesWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: VenuesOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'venues', TWith>[]> {
    const dbClient = tx || this.db;
    const venuesList = await dbClient.query.venues.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return venuesList;
  }

  async createVenue(data: NewVenue, tx?: DrizzleTransaction): Promise<Venue> {
    const dbClient = tx || this.db;
    const venue = await dbClient.insert(venues).values(data).returning();
    return venue[0];
  }

  async updateVenue(
    where: VenuesUpdateWhereInput,
    data: Partial<NewVenue>,
    tx?: DrizzleTransaction,
  ): Promise<Venue[]> {
    const dbClient = tx || this.db;
    const updatedVenue = await dbClient
      .update(venues)
      .set(data)
      .where(where)
      .returning();

    return updatedVenue;
  }

  async updateVenueById(
    id: string,
    data: Partial<NewVenue>,
    tx?: DrizzleTransaction,
  ): Promise<Venue[]> {
    return this.updateVenue(eq(venues.id, id), data, tx);
  }

  async deleteVenue(
    where: VenuesUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<Venue[]> {
    const dbClient = tx || this.db;
    const deletedVenue = await dbClient.delete(venues).where(where).returning();

    return deletedVenue;
  }

  async deleteVenueById(id: string, tx?: DrizzleTransaction): Promise<Venue[]> {
    return this.deleteVenue(eq(venues.id, id), tx);
  }

  async count(
    where?: VenuesUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(venues);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
