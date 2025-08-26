import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userMemberships } from "./user-memberships.schema";

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 50 }).notNull().unique(),

  description: text("description"),

  price: integer("price").notNull(),

  creditsGranted: integer("credits_granted").notNull().default(0),

  checkInsGranted: integer("check_ins_granted").notNull().default(0),

  durationDays: integer("duration_days").notNull(),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const membershipsRelations = relations(memberships, ({ many }) => ({
  userMemberships: many(userMemberships),
}));

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
