import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { users } from './users.schema';
import { venues } from './venues.schema';
import { bookings } from './bookings.schema';

export const checkIns = pgTable('check_ins', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),

  venueId: uuid('venue_id')
    .notNull()
    .references(() => venues.id),

  bookingId: uuid('booking_id').references(() => bookings.id, {
    onDelete: 'cascade',
  }),

  checkInTime: timestamp('check_in_time', { withTimezone: true })
    .notNull()
    .defaultNow(),

  checkOutTime: timestamp('check_out_time', { withTimezone: true }),
});

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
  venue: one(venues, {
    fields: [checkIns.venueId],
    references: [venues.id],
  }),
  booking: one(bookings, {
    fields: [checkIns.bookingId],
    references: [bookings.id],
  }),
}));

export type CheckIn = InferSelectModel<typeof checkIns>;
export type NewCheckIn = InferInsertModel<typeof checkIns>;
