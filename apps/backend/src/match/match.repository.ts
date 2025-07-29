import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewMatch, Match, matches } from '@sportefy/db-types';
import { SQL, and, count, eq, inArray, ne } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';
import { bookings, matchPlayers, slots } from '@sportefy/db-types';
import { MatchType, SlotEventType } from 'src/common/types';
import { Slot } from '@sportefy/db-types';

export type MatchesWithInput = NonNullable<
  Parameters<DrizzleClient['query']['matches']['findFirst']>[0]
>['with'];
export type MatchesWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['matches']['findFirst']>[0]
>['where'];
export type MatchesUpdateWhereInput = SQL<unknown>;
export type MatchesOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['matches']['findMany']>[0]
>['orderBy'];

@Injectable()
export class MatchRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) readonly db: DrizzleClient) {
    super(db);
  }

  async getMatch<TWith extends IncludeRelation<'matches'>>(
    where: MatchesWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matches', TWith> | undefined> {
    const dbClient = tx || this.db;
    const match = await dbClient.query.matches.findFirst({
      where,
      with: withRelations,
    });

    return match;
  }

  async getMatchById<TWith extends IncludeRelation<'matches'>>(
    matchId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matches', TWith> | undefined> {
    const dbClient = tx || this.db;
    const match = await dbClient.query.matches.findFirst({
      where: (matches, { eq }) => eq(matches.id, matchId),
      with: withRelations,
    });

    return match;
  }

  async getManyMatches<TWith extends IncludeRelation<'matches'>>(
    where: MatchesWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: MatchesOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matches', TWith>[]> {
    const dbClient = tx || this.db;
    const matchesList = await dbClient.query.matches.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return matchesList;
  }

  async createMatch(data: NewMatch, tx?: DrizzleTransaction): Promise<Match> {
    const dbClient = tx || this.db;
    const match = await dbClient.insert(matches).values(data).returning();
    return match[0];
  }

  async updateMatch(
    where: MatchesUpdateWhereInput,
    data: Partial<NewMatch>,
    tx?: DrizzleTransaction,
  ): Promise<Match[]> {
    const dbClient = tx || this.db;
    const updatedMatch = await dbClient
      .update(matches)
      .set(data)
      .where(where)
      .returning();

    return updatedMatch;
  }

  async updateMatchById(
    id: string,
    data: Partial<NewMatch>,
    tx?: DrizzleTransaction,
  ): Promise<Match[]> {
    return this.updateMatch(eq(matches.id, id), data, tx);
  }

  async deleteMatch(
    where: MatchesUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<Match[]> {
    const dbClient = tx || this.db;
    const deletedMatch = await dbClient
      .delete(matches)
      .where(where)
      .returning();

    return deletedMatch;
  }

  async deleteMatchById(id: string, tx?: DrizzleTransaction): Promise<Match[]> {
    return this.deleteMatch(eq(matches.id, id), tx);
  }

  async count(
    where?: MatchesUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(matches);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }

  async getFullMatchDetails(matchId: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const result = await dbClient.query.matches.findFirst({
      where: eq(matches.id, matchId),
      with: {
        matchPlayers: {
          with: {
            profile: {
              columns: {
                id: true,
                fullName: true,
                userName: true,
                avatarUrl: true,
              },
            },
          },
        },
        booking: {
          with: {
            slot: true,
            venue: true,
          },
        },
      },
    });
    return result;
  }

  async getMatchesByPlayerId<TWith extends IncludeRelation<'matches'>>(
    userId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matches', TWith>[]> {
    const dbClient = tx || this.db;

    // 1. Find all match IDs the user is a part of
    const playerMatchEntries = await dbClient
      .select({ matchId: matchPlayers.matchId })
      .from(matchPlayers)
      .where(eq(matchPlayers.userId, userId));

    if (playerMatchEntries.length === 0) {
      return [];
    }

    const matchIds = playerMatchEntries.map((p) => p.matchId);

    return this.getManyMatches(
      inArray(matches.id, matchIds),
      withRelations,
      undefined,
      undefined,
      undefined,
      tx,
    );
  }
}
