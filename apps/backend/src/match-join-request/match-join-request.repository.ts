import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { matchJoinRequests } from '@sportefy/db-types';
import { SQL, count, eq, and } from 'drizzle-orm';
import { DrizzleTransaction } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { IncludeRelation, InferResultType } from 'src/database/utils';

export type MatchJoinRequestsWithInput = NonNullable<
  Parameters<DrizzleClient['query']['matchJoinRequests']['findFirst']>[0]
>['with'];
export type MatchJoinRequestsWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['matchJoinRequests']['findFirst']>[0]
>['where'];
export type MatchJoinRequestsUpdateWhereInput = SQL<unknown> | undefined;
export type MatchJoinRequestsOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['matchJoinRequests']['findMany']>[0]
>['orderBy'];

@Injectable()
export class MatchJoinRequestRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getMatchJoinRequest<TWith extends IncludeRelation<'matchJoinRequests'>>(
    where: MatchJoinRequestsWhereInput,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchJoinRequests', TWith> | undefined> {
    const dbClient = tx || this.db;
    const matchJoinRequest = await dbClient.query.matchJoinRequests.findFirst({
      where,
      with: withRelations,
    });

    return matchJoinRequest;
  }

  async getMatchJoinRequestById<TWith extends IncludeRelation<'matchJoinRequests'>>(
    requestId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchJoinRequests', TWith> | undefined> {
    const dbClient = tx || this.db;
    const matchJoinRequest = await dbClient.query.matchJoinRequests.findFirst({
      where: (mjr) => eq(mjr.id, requestId),
      with: withRelations,
    });

    return matchJoinRequest;
  }

  async getManyMatchJoinRequests<TWith extends IncludeRelation<'matchJoinRequests'>>(
    where: MatchJoinRequestsWhereInput,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: MatchJoinRequestsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchJoinRequests', TWith>[]> {
    const dbClient = tx || this.db;
    const matchJoinRequestsList = await dbClient.query.matchJoinRequests.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return matchJoinRequestsList;
  }

  async createMatchJoinRequest(
    data: typeof matchJoinRequests.$inferInsert,
    tx?: DrizzleTransaction,
  ): Promise<typeof matchJoinRequests.$inferSelect> {
    const dbClient = tx || this.db;
    const [newMatchJoinRequest] = await dbClient
      .insert(matchJoinRequests)
      .values(data)
      .returning();
    return newMatchJoinRequest;
  }

  async updateMatchJoinRequest(
    where: MatchJoinRequestsUpdateWhereInput,
    data: Partial<typeof matchJoinRequests.$inferInsert>,
    tx?: DrizzleTransaction,
  ): Promise<Array<typeof matchJoinRequests.$inferSelect>> {
    const dbClient = tx || this.db;
    const updatedMatchJoinRequest = await dbClient
      .update(matchJoinRequests)
      .set(data)
      .where(where)
      .returning();

    return updatedMatchJoinRequest;
  }

  async updateMatchJoinRequestById(
    requestId: string,
    data: Partial<typeof matchJoinRequests.$inferInsert>,
    tx?: DrizzleTransaction,
  ): Promise<Array<typeof matchJoinRequests.$inferSelect>> {
    return this.updateMatchJoinRequest(
      eq(matchJoinRequests.id, requestId) as SQL<unknown>,
      data,
      tx,
    );
  }

  async deleteMatchJoinRequest(
    where: MatchJoinRequestsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<Array<typeof matchJoinRequests.$inferSelect>> {
    const dbClient = tx || this.db;
    const deletedMatchJoinRequest = await dbClient
      .delete(matchJoinRequests)
      .where(where)
      .returning();

    return deletedMatchJoinRequest;
  }

  async deleteMatchJoinRequestById(
    requestId: string,
    tx?: DrizzleTransaction,
  ): Promise<Array<typeof matchJoinRequests.$inferSelect>> {
    return this.deleteMatchJoinRequest(
      eq(matchJoinRequests.id, requestId) as SQL<unknown>,
      tx,
    );
  }

  async count(
    where?: MatchJoinRequestsUpdateWhereInput,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(matchJoinRequests);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }

  // Additional methods specific to matchJoinRequests
  async getRequestsByMatch<TWith extends IncludeRelation<'matchJoinRequests'>>(
    matchId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchJoinRequests', TWith>[]> {
    return this.getManyMatchJoinRequests(
      (mjr) => eq(mjr.matchId, matchId),
      withRelations,
      undefined,
      undefined,
      undefined,
      tx,
    );
  }

  async getRequestsByUser<TWith extends IncludeRelation<'matchJoinRequests'>>(
    userId: string,
    withRelations?: TWith,
    limit?: number,
    offset?: number,
    orderBy?: MatchJoinRequestsOrderByInput,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchJoinRequests', TWith>[]> {
    return this.getManyMatchJoinRequests(
      (mjr) => eq(mjr.requesterId, userId),
      withRelations,
      limit,
      offset,
      orderBy,
      tx,
    );
  }

  async getPendingRequestsForMatch<TWith extends IncludeRelation<'matchJoinRequests'>>(
    matchId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchJoinRequests', TWith>[]> {
    return this.getManyMatchJoinRequests(
      (mjr) => and(eq(mjr.matchId, matchId), eq(mjr.status, 'pending')),
      withRelations,
      undefined,
      undefined,
      undefined,
      tx,
    );
  }

  async hasUserRequestedToJoinMatch(
    matchId: string,
    userId: string,
    tx?: DrizzleTransaction,
  ): Promise<boolean> {
    const request = await this.getMatchJoinRequest(
      (mjr) => and(eq(mjr.matchId, matchId), eq(mjr.requesterId, userId)),
      undefined,
      tx,
    );
    return !!request;
  }

  async getUserPendingRequestForMatch<TWith extends IncludeRelation<'matchJoinRequests'>>(
    matchId: string,
    userId: string,
    withRelations?: TWith,
    tx?: DrizzleTransaction,
  ): Promise<InferResultType<'matchJoinRequests', TWith> | undefined> {
    return this.getMatchJoinRequest(
      (mjr) => and(
        eq(mjr.matchId, matchId),
        eq(mjr.requesterId, userId),
        eq(mjr.status, 'pending')
      ),
      withRelations,
      tx,
    );
  }

  async getPendingRequestsForUserOwnedMatches(
    userId: string,
    limit?: number,
    offset?: number,
    orderBy?: MatchJoinRequestsOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    
    const requests = await dbClient.query.matchJoinRequests.findMany({
      where: (mjr, { eq }) => eq(mjr.status, 'pending'),
      with: {
        match: {
          with: {
            booking: {
              with: {
                slot: true,
                venue: {
                  columns: { name: true }
                }
              }
            }
          }
        },
        requesterProfile: { 
          columns: { 
            fullName: true, 
            avatarUrl: true, 
            gender: true, 
            age: true 
          } 
        }
      },
      limit,
      offset,
      orderBy,
    });

    return requests.filter(request => 
      request.match?.status === 'open' && 
      request.match?.booking?.bookedBy === userId
    );
  }
}
