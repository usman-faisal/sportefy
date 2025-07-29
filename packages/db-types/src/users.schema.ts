import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { pgSchema, uuid } from 'drizzle-orm/pg-core';
import { profiles } from './profiles.schema';
import { userScopes } from './user-scopes.schema';
import { facilities } from './facilities.schema';
import { matchPlayers } from './match-players.schema';

export const authSchema = pgSchema('auth');

export const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  userScopes: many(userScopes),
  facilities: many(facilities),
  matchAsPlayers: many(matchPlayers),
}));

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
