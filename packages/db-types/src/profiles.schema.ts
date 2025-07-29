import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  varchar,
  check,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import {
  InferInsertModel,
  InferSelectModel,
  relations,
  sql,
} from 'drizzle-orm';
import { userScopes } from './user-scopes.schema';
import { bookings } from './bookings.schema';
import { transactions } from './transactions.schema';
import { reviews } from './reviews.schema';

export const roleEnum = pgEnum('user_role', ['admin', 'user']);
export const genderEnum = pgEnum('gender', ['male', 'female']);

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),

    fullName: text('full_name').notNull(),

    role: roleEnum().default('user').notNull(),

    avatarUrl: text('avatar_url'),

    email: varchar('email', { length: 255 }).notNull().unique(),
    /*
      USER DETAILS
    */
    userName: varchar('user_name', { length: 255 }).unique(),

    gender: genderEnum(),

    age: integer(),

    address: text(),

    organization: text(),

    phoneNumber: varchar('phone_number', { length: 255 }),

    credits: integer('credits').default(0),
    checkIns: integer('check_ins').default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check('age_check', sql`${table.age} > 0 AND ${table.age} < 100`),
    check('username_check', sql`length(${table.userName}) < 16`),
    check('credits_check', sql`${table.credits} >= 0`), // Ensure credits cannot be negative
    check('check_ins_check', sql`${table.checkIns} >= 0`), // Ensure check-ins cannot be negative
  ],
);

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
  userScopes: many(userScopes),
  bookings: many(bookings),
  transactions: many(transactions),
  reviews: many(reviews),
}));

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;
