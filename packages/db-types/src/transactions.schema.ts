import {
  pgTable,
  uuid,
  integer,
  timestamp,
  pgEnum,
  text,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { payments } from "./payments.schema";
import { bookings } from "./bookings.schema";
import { users } from "./users.schema";
import { profiles } from "./profiles.schema";

// Define enum for the type of transaction
export const transactionTypeEnum = pgEnum("transaction_type", [
  "top_up",
  "booking_fee",
  "cancellation_refund",
  "transfer_in",
  "transfer_out",
  "membership_purchase",
]);

export const transactions = pgTable("transactions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  type: transactionTypeEnum("type").notNull(),

  // Amount can be positive (top-up/refund) or negative (booking_fee)
  amount: integer("amount").notNull(),

  // Nullable foreign keys, as a transaction might relate to only one
  paymentId: uuid("payment_id").references(() => payments.id, {
    onDelete: "set null",
  }),

  bookingId: uuid("booking_id").references(() => bookings.id, {
    onDelete: "set null",
  }),

  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
});

// Define relationships for the transactions table
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  profile: one(profiles, {
    fields: [transactions.userId],
    references: [profiles.id],
  }),
  payment: one(payments, {
    fields: [transactions.paymentId],
    references: [payments.id],
  }),
  booking: one(bookings, {
    fields: [transactions.bookingId],
    references: [bookings.id],
  }),
}));

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
