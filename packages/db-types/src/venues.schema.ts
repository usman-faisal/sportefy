import {
  pgEnum,
  pgTable,
  uuid,
  timestamp,
  text,
  varchar,
  integer,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { facilities } from './facilities.schema';
import { operatingHours } from './operating-hours.schema';
import { media } from './media.schema';
import { userScopes } from './user-scopes.schema';
import { bookings } from './bookings.schema';
import { maintenanceSchedules } from './maintenance-schedules.schema';
import { slots } from './slots.schema';
import { venueSports } from './venue-sports.schema';
import { reviews } from './reviews.schema';

export const spaceTypeEnum = pgEnum('space_type', ['indoor', 'outdoor']);
export const availabilityEnum = pgEnum('availability', [
  'active',
  'inactive',
  'maintenance',
]);

export const venues = pgTable('venues', {
  id: uuid('id').primaryKey().defaultRandom(),

  facilityId: uuid('facility_id')
    .notNull()
    .references(() => facilities.id),

  name: varchar({ length: 255 }),

  phoneNumber: varchar({ length: 255 }),

  spaceType: spaceTypeEnum(),

  availability: availabilityEnum(),

  basePrice: integer('base_price').notNull(),

  capacity: integer('capacity').notNull(),

  address: text('address'),

  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),

  totalReviews: integer('total_reviews').default(0),
  rating: integer('rating').default(0),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const venuesRelations = relations(venues, ({ one, many }) => ({
  facility: one(facilities, {
    fields: [venues.facilityId],
    references: [facilities.id],
  }),
  operatingHours: many(operatingHours),
  media: many(media),
  userScopes: many(userScopes),
  bookings: many(bookings),
  maintenanceSchedules: many(maintenanceSchedules),
  slots: many(slots),
  sports: many(venueSports),
  reviews: many(reviews),
}));

export type Venue = InferSelectModel<typeof venues>;
export type NewVenue = InferInsertModel<typeof venues>;
