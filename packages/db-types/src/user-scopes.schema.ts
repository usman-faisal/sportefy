import { pgEnum, pgTable, uuid, timestamp, check } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { InferInsertModel, InferSelectModel, relations, sql } from "drizzle-orm";
import { profiles } from "./profiles.schema";
import { facilities } from "./facilities.schema";
import { venues } from "./venues.schema";

export const scopesRole = pgEnum('scope_role', ['moderator', 'owner'])

export const userScopes = pgTable('user_scopes', {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Can either be event.id or facility.id
    venueId: uuid('venue_id').references(() => venues.id, { onDelete: 'cascade' }),
    facilityId: uuid('facility_id').references(() => facilities.id, { onDelete: 'cascade' }),

    role: scopesRole('role').notNull(),

    // who granted the moderator role
    grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'cascade' }),
    grantedAt: timestamp('granted_at', {withTimezone: true}).defaultNow(),

    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow(),
}, (table) => {
    return {
        // This CHECK constraint ensures a user scope is tied to
        // exactly ONE entity (either a venue or a facility).
        checkOneScope: check('check_one_scope', sql`
            (
                CASE WHEN ${table.venueId} IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN ${table.facilityId} IS NOT NULL THEN 1 ELSE 0 END
            ) = 1
        `),
    };
});


export const moderatorsRelations = relations(userScopes, ({one}) => ({
    user: one(users, {
        fields: [userScopes.userId],
        references: [users.id]
    }),
    profile: one(profiles, {
        fields: [userScopes.userId],
        references: [profiles.id]
    }),
    facility: one(facilities, {
        fields: [userScopes.facilityId],
        references: [facilities.id]
    }),
    venue: one(venues, {
        fields: [userScopes.venueId],
        references: [venues.id]
    })
}))

export type UserScope = InferSelectModel<typeof userScopes>;
export type NewUserScope = InferInsertModel<typeof userScopes>;