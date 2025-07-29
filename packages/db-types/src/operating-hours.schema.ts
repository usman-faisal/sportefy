import {
  pgTable,
  serial,
  uuid,
  varchar,
  boolean,
  time,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { facilities } from "./facilities.schema";
import {
  InferInsertModel,
  InferSelectModel,
  relations,
  sql,
} from "drizzle-orm";
import { venues } from "./venues.schema";

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

export const operatingHours = pgTable(
  "operating_hours",
  {
    id: serial("id").primaryKey(),

    facilityId: uuid("facility_id").references(() => facilities.id, {
      onDelete: "cascade",
    }),

    venueId: uuid("venue_id").references(() => venues.id, {
      onDelete: "cascade",
    }),

    openTime: time("open_time"),
    closeTime: time("close_time"),
    // dayOfWeek: varchar('day_of_week', { length: 10 }).notNull(), // 'monday', 'tuesday', etc.
    dayOfWeek: dayOfWeekEnum("day_of_week"),
  },
  (table) => {
    return {
      checkOneParent: check(
        "check_one_parent",
        sql`
            (
                CASE WHEN ${table.venueId} IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN ${table.facilityId} IS NOT NULL THEN 1 ELSE 0 END
            ) = 1
        `
      ),
    };
  }
);

export const operatingHoursRelations = relations(operatingHours, ({ one }) => ({
  facility: one(facilities, {
    fields: [operatingHours.facilityId],
    references: [facilities.id],
  }),
  venue: one(venues, {
    fields: [operatingHours.venueId],
    references: [venues.id],
  }),
}));

export type OperatingHour = InferSelectModel<typeof operatingHours>;
export type NewOperatingHour = InferInsertModel<typeof operatingHours>;
