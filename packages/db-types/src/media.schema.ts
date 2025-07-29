import {
  pgEnum,
  pgTable,
  uuid,
  text,
  varchar,
  check,
} from 'drizzle-orm/pg-core';
import {
  InferInsertModel,
  InferSelectModel,
  relations,
  sql,
} from 'drizzle-orm';
import { venues } from './venues.schema';
import { facilities } from './facilities.schema'; // Assuming this exists
import { reviews } from './reviews.schema';

export const mediaTypeEnum = pgEnum('media_enum', ['image', 'video', 'audio']);
export const mediaEntityTypeEnum = pgEnum('media_entity_type', [
  'venue',
  'facility',
  'review',
  'payment',
]);

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),

  entityId: uuid('entity_id').notNull(),
  entityType: mediaEntityTypeEnum('entity_type').notNull(),

  mediaLink: text('media_link').notNull(),
  mediaType: mediaTypeEnum('media_type').default('image'),
});

export const mediaRelations = relations(media, ({ one }) => ({
  venue: one(venues, {
    fields: [media.entityId],
    references: [venues.id],
  }),
  facility: one(facilities, {
    fields: [media.entityId],
    references: [facilities.id],
  }),
  review: one(reviews, {
    fields: [media.entityId],
    references: [reviews.id],
  }),
}));

export type Media = InferSelectModel<typeof media>;
export type NewMedia = InferInsertModel<typeof media>;
