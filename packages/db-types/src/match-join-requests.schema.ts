import {
  pgEnum,
  pgTable,
  uuid,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { matches } from './matches.schema';
import { users } from './users.schema';
import { profiles } from './profiles.schema';
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { matchPlayerTeamEnum } from './match-players.schema';

export const matchJoinRequestStatusEnum = pgEnum('match_join_request_status', [
  'pending',
  'approved',
  'rejected',
]);

export const matchJoinRequests = pgTable('match_join_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  requesterId: uuid('requester_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  preferredTeam: matchPlayerTeamEnum('preferred_team'),
  status: matchJoinRequestStatusEnum('status').notNull().default('pending'),
  message: text('message'), // Optional message from the requester
  reviewedBy: uuid('reviewed_by').references(() => users.id), // Who approved/rejected
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const matchJoinRequestsRelations = relations(matchJoinRequests, ({ one }) => ({
  match: one(matches, {
    fields: [matchJoinRequests.matchId],
    references: [matches.id],
  }),
  requester: one(users, {
    fields: [matchJoinRequests.requesterId],
    references: [users.id],
  }),
  requesterProfile: one(profiles, {
    fields: [matchJoinRequests.requesterId],
    references: [profiles.id],
  }),
  reviewer: one(users, {
    fields: [matchJoinRequests.reviewedBy],
    references: [users.id],
  }),
  reviewerProfile: one(profiles, {
    fields: [matchJoinRequests.reviewedBy],
    references: [profiles.id],
  }),
}));

export type MatchJoinRequest = InferSelectModel<typeof matchJoinRequests>;
export type NewMatchJoinRequest = InferInsertModel<typeof matchJoinRequests>;
