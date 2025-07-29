import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { venueSports } from './venue-sports.schema';
import { matches } from './matches.schema';

export const sportTypeEnum = pgEnum('sport_type', ['single', 'multiple']);

export const sports = pgTable('sports', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: varchar({ length: 255 }).notNull(),

  timeBound: boolean('time_bound').default(true),

  sportType: sportTypeEnum('sport_type'),
});

export const sportsRelations = relations(sports, ({ many }) => ({
  venues: many(venueSports),
  matches: many(matches),
}));

export type Sport = InferSelectModel<typeof sports>;
export type NewSport = InferInsertModel<typeof sports>;
