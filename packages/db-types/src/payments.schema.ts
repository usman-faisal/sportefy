import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './users.schema';
import { transactions } from './transactions.schema';

// Define enums for payment method and status
export const paymentMethodEnum = pgEnum('payment_method', [
  'bank_transfer',
  'card',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'approved',
  'rejected',
]);

export const payments = pgTable('payments', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  amountCredits: integer('amount_credits').notNull(),

  method: paymentMethodEnum('method').notNull(),

  status: paymentStatusEnum('status').notNull().default('pending'),

  screenshotUrl: text('screenshot_url'), // Nullable, as it's added after initiation

  rejectionReason: text('rejection_reason'), // Nullable

  verifiedBy: uuid('verified_by').references(() => users.id, {
    onDelete: 'set null',
  }), // Admin who verified

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relationships for the payments table
export const paymentsRelations = relations(payments, ({ one, many }) => ({
  // The user who made the payment
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
    relationName: 'payment_user',
  }),
  // The admin who verified the payment
  verifier: one(users, {
    fields: [payments.verifiedBy],
    references: [users.id],
    relationName: 'payment_verifier',
  }),
  transaction: one(transactions),
}));

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
