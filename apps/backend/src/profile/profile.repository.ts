import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewProfile, Profile, profiles } from '@sportefy/db-types';
import { and, count, eq, ilike, or, sql } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';
import { UserRole } from 'src/common/types';

export type ProfilesWithInput = NonNullable<
  Parameters<DrizzleClient['query']['profiles']['findFirst']>[0]
>['with'];
export type ProfilesWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['profiles']['findFirst']>[0]
>['where'];
export type ProfilesOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['profiles']['findMany']>[0]
>['orderBy'];

@Injectable()
export class ProfileRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getProfile(
    where: ProfilesWhereInput,
    withRelations?: ProfilesWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const profile = await dbClient.query.profiles.findFirst({
      where,
      with: withRelations,
    });

    return profile;
  }

  async getProfileById(profileId: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const profile = await dbClient.query.profiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.id, profileId),
    });

    return profile;
  }

  async getManyProfiles(
    where: ProfilesWhereInput,
    withRelations?: ProfilesWithInput,
    limit?: number,
    offset?: number,
    orderBy?: ProfilesOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const profilesList = await dbClient.query.profiles.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return profilesList;
  }

  async findAndCount(options: {
    search?: string;
    limit: number;
    offset: number;
  }) {
    const { search, limit, offset } = options;

    const searchCondition = search
      ? or(
          ilike(profiles.fullName, `%${search}%`),
          ilike(profiles.email, `%${search}%`),
        )
      : undefined;

    const where = searchCondition ? and(searchCondition) : undefined;

    const [users, totalResult] = await Promise.all([
      this.db.query.profiles.findMany({
        where,
        limit,
        offset,
        orderBy: (profiles, { desc }) => [desc(profiles.createdAt)],
      }),
      this.db.select({ count: count() }).from(profiles).where(where),
    ]);

    return {
      users,
      total: totalResult[0].count,
    };
  }

  async findUserWithDetails(userId: string) {
    return this.db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      with: {
        bookings: {
          with: {
            venue: true,
            match: true,
          },
          orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
          limit: 20,
        },
        transactions: {
          orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
          limit: 20,
        },
      },
    });
  }

  async createProfile(
    data: NewProfile,
    tx?: DrizzleTransaction,
  ): Promise<Profile> {
    const dbClient = tx || this.db;
    const profile = await dbClient.insert(profiles).values(data).returning();

    return profile[0];
  }

  async updateProfile(
    where: SqlUnknown,
    data: Partial<NewProfile>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const updatedProfile = await dbClient
      .update(profiles)
      .set(data)
      .where(where)
      .returning();

    return updatedProfile;
  }

  async updateProfileById(
    id: string,
    data: Partial<NewProfile>,
    tx?: DrizzleTransaction,
  ) {
    return this.updateProfile(eq(profiles.id, id), data, tx);
  }

  async deleteProfile(
    where: SqlUnknown,
    tx?: DrizzleTransaction,
  ): Promise<Profile[]> {
    const dbClient = tx || this.db;
    const deletedProfile = await dbClient
      .delete(profiles)
      .where(where)
      .returning();

    return deletedProfile;
  }

  async deleteProfileById(id: string, tx?: DrizzleTransaction) {
    return this.deleteProfile(eq(profiles.id, id), tx);
  }

  async updateProfileCredits(
    where: SqlUnknown,
    amount: number,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient
      .update(profiles)
      .set({ credits: sql`${profiles.credits} + ${amount}` })
      .where(where);
  }

  async updateProfileCheckIns(
    where: SqlUnknown,
    amount: number,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    return dbClient
      .update(profiles)
      .set({ checkIns: sql`${profiles.checkIns} + ${amount}` })
      .where(where);
  }

  async updateProfileCreditsById(
    id: string,
    amount: number,
    tx?: DrizzleTransaction,
  ) {
    return this.updateProfileCredits(eq(profiles.id, id), amount, tx);
  }

  async count(where?: SqlUnknown, tx?: DrizzleTransaction): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(profiles);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
