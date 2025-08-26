// src/db/schema/userMemberships.schema.ts
import { pgTable, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.schema"; // Assuming auth.users is aliased as 'users'
import { memberships } from "./memberships.schema";
import { payments } from "./payments.schema";

export const userMemberships = pgTable("user_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  membershipId: uuid("membership_id")
    .notNull()
    .references(() => memberships.id, { onDelete: "restrict" }),

  paymentId: uuid("payment_id")
    .notNull()
    .references(() => payments.id),

  startDate: timestamp("start_date").notNull(),

  endDate: timestamp("end_date").notNull(),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
});

export const userMembershipsRelations = relations(
  userMemberships,
  ({ one }) => ({
    user: one(users, {
      fields: [userMemberships.userId],
      references: [users.id],
    }),
    membership: one(memberships, {
      fields: [userMemberships.membershipId],
      references: [memberships.id],
    }),
    payment: one(payments, {
      fields: [userMemberships.paymentId],
      references: [payments.id],
    }),
  })
);

export type UserMembership = typeof userMemberships.$inferSelect;
export type NewUserMembership = typeof userMemberships.$inferInsert;
