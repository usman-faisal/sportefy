// Create a new file: @sportefy/db-types/venue-sports.ts
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { venues } from "./venues.schema";
import { sports } from "./sports.schema";

export const venueSports = pgTable(
  "venue_sports",
  {
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    sportId: uuid("sport_id")
      .notNull()
      .references(() => sports.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.venueId, t.sportId] }),
  })
);

export const venueSportsRelations = relations(venueSports, ({ one }) => ({
  venue: one(venues, {
    fields: [venueSports.venueId],
    references: [venues.id],
  }),
  sport: one(sports, {
    fields: [venueSports.sportId],
    references: [sports.id],
  }),
}));

export type VenueSport = InferSelectModel<typeof venueSports>;
export type NewVenueSport = InferInsertModel<typeof venueSports>;
