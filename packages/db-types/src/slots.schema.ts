// src/db/schema/slots.schema.ts

import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { venues } from './venues.schema';
import { bookings } from './bookings.schema';
import { maintenanceSchedules } from './maintenance-schedules.schema';

export const slotEventTypeEnum = pgEnum('slot_event_type', [
  'booking',
  'maintenance',
]);

export const slots = pgTable('slots', {
  id: uuid('id').primaryKey().defaultRandom(),

  venueId: uuid('venue_id')
    .notNull()
    .references(() => venues.id, { onDelete: 'cascade' }),

  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),

  eventType: slotEventTypeEnum('event_type').notNull(),

  eventId: uuid('event_id').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const slotsRelations = relations(slots, ({ one }) => ({
  venue: one(venues, {
    fields: [slots.venueId],
    references: [venues.id],
  }),
  booking: one(bookings, {
    fields: [slots.eventId],
    references: [bookings.id],
  }),
  maintenanceSchedule: one(maintenanceSchedules, {
    fields: [slots.eventId],
    references: [maintenanceSchedules.id],
  }),
}));

export type Slot = InferSelectModel<typeof slots>;
export type NewSlot = InferInsertModel<typeof slots>;
