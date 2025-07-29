import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { NewMedia, Media, media as mediaSchema } from '@sportefy/db-types';
import { count, eq } from 'drizzle-orm';
import { DrizzleTransaction, SqlUnknown } from 'src/database/types';
import { BaseRepository } from 'src/common/base.repository';

export type MediaWithInput = NonNullable<
  Parameters<DrizzleClient['query']['media']['findFirst']>[0]
>['with'];
export type MediaWhereInput = NonNullable<
  Parameters<DrizzleClient['query']['media']['findFirst']>[0]
>['where'];
export type MediaOrderByInput = NonNullable<
  Parameters<DrizzleClient['query']['media']['findMany']>[0]
>['orderBy'];

@Injectable()
export class MediaRepository extends BaseRepository {
  constructor(@Inject(DRIZZLE_CLIENT) protected readonly db: DrizzleClient) {
    super(db);
  }

  async getMedia(
    where: MediaWhereInput,
    withRelations?: MediaWithInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const media = await dbClient.query.media.findFirst({
      where,
      with: withRelations,
    });

    return media;
  }

  async getMediaById(mediaId: string, tx?: DrizzleTransaction) {
    const dbClient = tx || this.db;
    const media = await dbClient.query.media.findFirst({
      where: (media, { eq }) => eq(media.id, mediaId),
    });

    return media;
  }

  async getManyMedia(
    where: MediaWhereInput,
    withRelations?: MediaWithInput,
    limit?: number,
    offset?: number,
    orderBy?: MediaOrderByInput,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const mediaList = await dbClient.query.media.findMany({
      where,
      with: withRelations,
      limit,
      offset,
      orderBy,
    });

    return mediaList;
  }

  async createMedia(data: NewMedia, tx?: DrizzleTransaction): Promise<Media> {
    const dbClient = tx || this.db;
    const media = await dbClient.insert(mediaSchema).values(data).returning();

    return media[0];
  }

  async createManyMedia(
    data: NewMedia[],
    tx?: DrizzleTransaction,
  ): Promise<Media[]> {
    const dbClient = tx || this.db;
    const mediaList = await dbClient
      .insert(mediaSchema)
      .values(data)
      .returning();

    return mediaList;
  }

  async updateMedia(
    where: SqlUnknown,
    data: Partial<NewMedia>,
    tx?: DrizzleTransaction,
  ) {
    const dbClient = tx || this.db;
    const updatedMedia = await dbClient
      .update(mediaSchema)
      .set(data)
      .where(where)
      .returning();

    return updatedMedia;
  }

  async updateMediaById(
    id: string,
    data: Partial<NewMedia>,
    tx?: DrizzleTransaction,
  ) {
    return this.updateMedia(eq(mediaSchema.id, id), data, tx);
  }

  async deleteMedia(
    where: SqlUnknown,
    tx?: DrizzleTransaction,
  ): Promise<Media[]> {
    const dbClient = tx || this.db;
    const deletedMedia = await dbClient
      .delete(mediaSchema)
      .where(where)
      .returning();

    return deletedMedia;
  }

  async deleteMediaById(id: string, tx?: DrizzleTransaction) {
    return this.deleteMedia(eq(mediaSchema.id, id), tx);
  }

  async count(where?: SqlUnknown, tx?: DrizzleTransaction): Promise<number> {
    const dbClient = tx || this.db;
    const query = dbClient.select({ count: count() }).from(mediaSchema);

    if (where) {
      query.where(where);
    }

    const [totalResult] = await query;
    return totalResult.count;
  }
}
