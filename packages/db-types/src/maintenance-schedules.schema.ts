import { pgTable, uuid, timestamp, text } from 'drizzle-orm/pg-core';
import { venues } from './venues.schema';
import { users } from './users.schema';
import { relations } from 'drizzle-orm/relations';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { slots } from './slots.schema';

export const maintenanceSchedules = pgTable('maintenance_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),

  venueId: uuid('venue_id').references(() => venues.id, {
    onDelete: 'cascade',
  }),

  reason: text('reason'),

  // The admin who created this block
  scheduledBy: uuid('scheduled_by').references(() => users.id),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const maintenanceSchedulesRelations = relations(
  maintenanceSchedules,
  ({ one }) => ({
    venue: one(venues, {
      fields: [maintenanceSchedules.venueId],
      references: [venues.id],
    }),
    scheduledByUser: one(users, {
      fields: [maintenanceSchedules.scheduledBy],
      references: [users.id],
    }),
    slot: one(slots, {
      fields: [maintenanceSchedules.id],
      references: [slots.eventId],
    }),
  }),
);

export type MaintenanceSchedule = InferSelectModel<typeof maintenanceSchedules>;
export type NewMaintenanceSchedule = InferInsertModel<
  typeof maintenanceSchedules
>;
