import {
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { matches } from './matches.schema';
import { users } from './users.schema';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { profiles } from './profiles.schema';

export const matchPlayerTeamEnum = pgEnum('match_player_team', ['A', 'B']);

export const matchPlayers = pgTable(
  'match_players',
  {
    matchId: uuid('match_id')
      .notNull()
      .references(() => matches.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    team: matchPlayerTeamEnum('team'),
  },
  (table) => [primaryKey({ columns: [table.matchId, table.userId] })],
);

export const matchPlayersRelations = relations(matchPlayers, ({ one }) => ({
  match: one(matches, {
    fields: [matchPlayers.matchId],
    references: [matches.id],
  }),
  user: one(users, {
    fields: [matchPlayers.userId],
    references: [users.id],
  }),
  profile: one(profiles, {
    fields: [matchPlayers.userId],
    references: [profiles.id],
  }),
}));

export type MatchPlayer = InferSelectModel<typeof matchPlayers>;
export type NewMatchPlayer = InferInsertModel<typeof matchPlayers>;
