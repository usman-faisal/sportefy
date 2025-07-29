import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewSport, Sport, sports } from '@sportefy/db-types';
import { SQL, count, eq } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

export type SportsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['sports']['findFirst']>[0]
>['with'];
export type SportsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['sports']['findFirst']>[0]
>['where'];
export type SportsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['sports']['findMany']>[0]
>['orderBy'];

@Injectable()
export class SportRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getSport(
    where: SportsWhereInput,
    withRelations?: SportsWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const sport = await dbClient.query.sports.findFirst({
      where,
      with: withRelations,
    });

    return sport;
  }

  async getSportById(sportId: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const sport = await dbClient.query.sports.findFirst({
      where: (sports, { eq }) => eq(sports.id, sportId),
    });

    return sport;
  }

  async getManySports(
    where?: SportsWhereInput,
    withRelations?: SportsWithInput,
    limit?: number,
    offset?: number,
    orderBy?: SportsOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const sportsList = await dbClient.query.sports.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return sportsList;
  }

  async createSport(data: NewSport, tx?: DrizzleTransaction): Promise<Sport> {
    const dbClient = tx || this.db;
    const sport = await dbClient.insert(sports).values(data).returning();

    return sport[0];
  }

  async updateSport(
    where: SqlUnknown,
    data: Partial<NewSport>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const updatedSport = await dbClient
      .update(sports)
      .set(data)
      .where(where)
      .returning();

    return updatedSport;
  }

  async updateSportById(
    id: string,
    data: Partial<NewSport>,
    tx?: DrizzleTransaction,
  ) {
    return this.updateSport(eq(sports.id, id), data, tx);
  }

  async deleteSport(
    where: SqlUnknown,
    tx?: DrizzleTransaction,
  ): Promise<Sport[]> {
    const dbClient = tx || this.db;
    const deletedSport = await dbClient.delete(sports).where(where).returning();

    return deletedSport;
  }

  async deleteSportById(id: string, tx?: DrizzleTransaction) {
    return this.deleteSport(eq(sports.id, id), tx);
  }

  async count(where?: SqlUnknown, tx?: DrizzleTransaction): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(sports);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
