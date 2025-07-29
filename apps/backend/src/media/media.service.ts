import { Injectable } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { CreateMediaDto } from './dto/create-media.dto';
import { media, NewMedia } from '@sportefy/db-types';
import { MediaEntityType } from 'src/common/types';
import { and, eq } from 'drizzle-orm';
import { ResponseBuilder } from 'src/common/utils/response-builder';

@Injectable()
export class MediaService {
  constructor(private readonly mediaRepository: MediaRepository) {}

  /**
   *
   * @param entityId The ID of the location to create media for.
   * Creates multiple media entries for a location.
   * @param mediaDto The media data to create.
   * @param tx Optional transaction for database operations.
   * @returns The created media entries.
   */
  async createMedia(
    entityId: string,
    entity: MediaEntityType,
    mediaDto: CreateMediaDto[],
  ) {
    if (!mediaDto || mediaDto.length === 0) {
      return [];
    }

    const NewMedia: NewMedia[] = mediaDto.map((media) => ({
      ...media,
      entityId: entityId,
      entityType: entity,
    }));

    return ResponseBuilder.success(
      await this.mediaRepository.createManyMedia(NewMedia),
      'Media created successfully',
    );
  }

  /**
   * Deletes media for a specific location.
   * @param entityId The ID of the location.
   * @param mediaId The ID of the media to delete.
   * @param scope The scope of the media (e.g., venue, facility).
   * @param tx Optional transaction for database operations.
   */
  async deleteMedia(
    entityType: MediaEntityType,
    entityId?: string,
    mediaId?: string,
  ) {
    await this.mediaRepository.deleteMedia(
      and(
        eq(media.entityType, entityType),
        entityId ? eq(media.entityId, entityId) : undefined,
        mediaId ? eq(media.id, mediaId) : undefined,
      ),
    );

    return ResponseBuilder.deleted('Media deleted successfully');
  }

  /**
   * Retrieves media for a specific location.
   * @param entityId The ID of the location.
   * @param scope The scope of the media (e.g., venue, facility).
   * @returns The media entries for the location.
   */
  async getMedia(entityType: MediaEntityType, entityId: string) {
    return ResponseBuilder.success(
      await this.mediaRepository.getMedia(
        and(eq(media.entityId, entityId), eq(media.entityType, entityType)),
      ),
    );
  }
}
