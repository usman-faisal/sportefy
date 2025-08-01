import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
  text,
  integer,
} from 'drizzle-orm/pg-core';
import { venues } from './venues.schema';
import { users } from './users.schema';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { matches } from './matches.schema';
import { slots } from './slots.schema';
import { profiles } from './profiles.schema';
import { checkIns } from './check-ins.schema';

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
]);

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),

  venueId: uuid('venue_id')
    .notNull()
    .references(() => venues.id, {onDelete: 'cascade'}),

  bookedBy: uuid('booked_by')
    .notNull()
    .references(() => users.id),

  status: bookingStatusEnum('status').notNull().default('pending'),

  totalCredits: integer('total_credits').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  venue: one(venues, {
    fields: [bookings.venueId],
    references: [venues.id],
  }),
  bookedByUser: one(users, {
    fields: [bookings.bookedBy],
    references: [users.id],
  }),
  bookedByProfile: one(profiles, {
    fields: [bookings.bookedBy],
    references: [profiles.id],
  }),
  match: one(matches, {
    fields: [bookings.id],
    references: [matches.bookingId],
  }),
  slot: one(slots, {
    fields: [bookings.id],
    references: [slots.eventId],
  }),
  chekIns: many(checkIns),
}));

export type Booking = InferSelectModel<typeof bookings>;
export type NewBooking = InferInsertModel<typeof bookings>;
