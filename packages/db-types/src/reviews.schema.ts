import {
  pgTable,
  uuid,
  timestamp,
  integer,
  check,
  text,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { venues } from './venues.schema';
import { users } from './users.schema';
import { profiles } from './profiles.schema';
import { media } from './media.schema';

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    venueId: uuid('venue_id')
      .notNull()
      .references(() => venues.id, { onDelete: 'cascade' }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    rating: integer('rating').notNull(),

    comment: text('comment'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      'review_rating_check',
      sql`(${table.rating} >= 1 AND ${table.rating} <= 5)`,
    ),
  ],
);

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  venue: one(venues, {
    fields: [reviews.venueId],
    references: [venues.id],
  }),
  profile: one(profiles, {
    fields: [reviews.userId],
    references: [profiles.id],
  }),
  media: many(media),
}));

export type Review = InferSelectModel<typeof reviews>;
export type NewReview = InferInsertModel<typeof reviews>;
