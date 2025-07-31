import {
  pgEnum,
  pgTable,
  uuid,
  integer,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.schema";
import { users } from "./users.schema"; // Assuming you have a users table
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { matchPlayers } from "./match-players.schema";
import { sports } from "./sports.schema";

export const matchTypeEnum = pgEnum("match_type", ["private", "public"]);
export const matchStatusEnum = pgEnum("match_status", [
  "open",
  "full",
  "completed",
  "cancelled",
]);
export const genderPreferenceEnum = pgEnum("gender_preference", [
  "any",
  "male_only",
  "female_only",
]);
export const skillLevelEnum = pgEnum("skill_level", [
  "any",
  "beginner",
  "intermediate",
  "advanced",
]);
export const paymentSplitTypeEnum = pgEnum("payment_split_type", [
  "creator_pays_all",
  "split_evenly",
]);

export const matches = pgTable("matches", {
  // --- Core Match Information ---
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id, { onDelete: "cascade" }),
  matchType: matchTypeEnum("match_type").notNull().default("public"),
  status: matchStatusEnum("status").notNull().default("open"),

  // --- Player & Capacity Management ---
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  playerLimit: integer("player_limit").notNull(),

  // --- Discoverability & Details ---
  title: text("title"), // e.g., "Intermediate Doubles @ 6 PM"

  // --- Match Preferences ---
  genderPreference: genderPreferenceEnum("gender_preference")
    .notNull()
    .default("any"),
  skillLevel: skillLevelEnum("skill_level").default("any"),
  minAge: integer("min_age"), // Minimum preferred age for players
  maxAge: integer("max_age"), // Maximum preferred age for players
  organizationPreference: varchar("organization_preference", { length: 255 }), // e.g., "Google Alumni" or a specific company name

  sportId: uuid("sport_id")
    .references(() => sports.id)
    .notNull(),

  paymentSplitType:
    paymentSplitTypeEnum("payment_split_type").default("split_evenly"),

  inviteToken: uuid("invite_token").unique().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const matchesRelations = relations(matches, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [matches.bookingId],
    references: [bookings.id],
  }),
  createdBy: one(users, {
    fields: [matches.createdBy],
    references: [users.id],
  }),
  matchPlayers: many(matchPlayers),
  sport: one(sports, {
    fields: [matches.sportId],
    references: [sports.id],
  }),
}));

export type Match = InferSelectModel<typeof matches>;
export type NewMatch = InferInsertModel<typeof matches>;
