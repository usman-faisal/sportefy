import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { matchPlayers } from '@sportefy/db-types';
import { SQL, count, eq, and } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';

export type MatchPlayersWithInput = NonNullable<
  Parameters<DrizzleClient['query']['matchPlayers']['findFirst']>[0]
>['with'];
export type MatchPlayersWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['matchPlayers']['findFirst']>[0]
>['where'];
export type MatchPlayersUpdateWhereInput = SQL<unknown> | undefined;
export type MatchPlayersOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['matchPlayers']['findMany']>[0]
>['orderBy'];

@Injectable()
export class MatchPlayerRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getMatchPlayer<TWith extends IncludeRelation<'matchPlayers'>>(
    where: MatchPlayersWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchPlayers', TWith> | undefined> {
    const dbClient = tx || this.db;
    const matchPlayer = await dbClient.query.matchPlayers.findFirst({
      where,
      with: withRelations,
    });

    return matchPlayer;
  }

  async getMatchPlayerByIds<TWith extends IncludeRelation<'matchPlayers'>>(
    matchId: string,
    userId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchPlayers', TWith> | undefined> {
    const dbClient = tx || this.db;
    const matchPlayer = await dbClient.query.matchPlayers.findFirst({
      where: (mp) => and(eq(mp.matchId, matchId), eq(mp.userId, userId)),
      with: withRelations,
    });

    return matchPlayer;
  }

  async getManyMatchPlayers<TWith extends IncludeRelation<'matchPlayers'>>(
    where: MatchPlayersWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: MatchPlayersOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchPlayers', TWith>[]> {
    const dbClient = tx || this.db;
    const matchPlayersList = await dbClient.query.matchPlayers.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return matchPlayersList;
  }

  async createMatchPlayer(
    data: typeof matchPlayers.$inferInsert,
    tx?: DrizzleTransaction,
  ): Promise<typeof matchPlayers.$inferSelect> {
    const dbClient = tx || this.db;
    const [newMatchPlayer] = await dbClient
      .insert(matchPlayers)
      .values(data)
      .returning();
    return newMatchPlayer;
  }

  async updateMatchPlayer(
    where: MatchPlayersUpdateWhereInput,
    data: Partial<typeof matchPlayers.$inferInsert>,
    tx?: DrizzleTransaction,
  ): Promise<Array<typeof matchPlayers.$inferSelect>> {
    const dbClient = tx || this.db;
    const updatedMatchPlayer = await dbClient
      .update(matchPlayers)
      .set(data)
      .where(where)
      .returning();

    return updatedMatchPlayer;
  }

  async updateMatchPlayerByIds(
    matchId: string,
    userId: string,
    data: Partial<typeof matchPlayers.$inferInsert>,
    tx?: DrizzleTransaction,
  ): Promise<Array<typeof matchPlayers.$inferSelect>> {
    return this.updateMatchPlayer(
      and(
        eq(matchPlayers.matchId, matchId),
        eq(matchPlayers.userId, userId),
      ) as SQL<unknown>,
      data,
      tx,
    );
  }

  async deleteMatchPlayer(
    where: MatchPlayersUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<Array<typeof matchPlayers.$inferSelect>> {
    const dbClient = tx || this.db;
    const deletedMatchPlayer = await dbClient
      .delete(matchPlayers)
      .where(where)
      .returning();

    return deletedMatchPlayer;
  }

  async deleteMatchPlayerByIds(
    matchId: string,
    userId: string,
    tx?: DrizzleTransaction,
  ): Promise<Array<typeof matchPlayers.$inferSelect>> {
    return this.deleteMatchPlayer(
      and(
        eq(matchPlayers.matchId, matchId),
        eq(matchPlayers.userId, userId),
      ) as SQL<unknown>,
      tx,
    );
  }

  async count(
    where?: MatchPlayersUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(matchPlayers);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }

  // Additional methods specific to matchPlayers
  async getPlayersByMatch<TWith extends IncludeRelation<'matchPlayers'>>(
    matchId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchPlayers', TWith>[]> {
    return this.getManyMatchPlayers(
      (mp) => eq(mp.matchId, matchId),
      withRelations,
      undefined,
      undefined,
      undefined,
      tx,
    );
  }

  async getMatchesByPlayer<TWith extends IncludeRelation<'matchPlayers'>>(
    userId: string,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: MatchPlayersOrderByInput,

    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchPlayers', TWith>[]> {
    return this.getManyMatchPlayers(
      (mp) => eq(mp.userId, userId),
      withRelations,
      limit,
      offset,
      orderBy,
      tx,
    );
  }
}
