import { pgEnum, pgTable, uuid, timestamp, text, varchar, time, serial, boolean } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { users } from "./users.schema";
import { venues } from "./venues.schema";
import { operatingHours } from "./operating-hours.schema";
import { userScopes } from "./user-scopes.schema";
import { media } from "./media.schema";


export const facilities = pgTable('facilities', {
    id: uuid('id').primaryKey().defaultRandom(),

    ownerId: uuid('owner_id').references(() => users.id),

    name: varchar(),

    description: text(),

    phoneNumber: varchar('phone_number', {length: 255}),

    coverUrl: text('cover_url'),

    address: text(),

    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow(),
})


export const facilitiesRelations = relations(facilities, ({one,many}) => ({
    venues: many(venues),
    operatingHours: many(operatingHours),
    owner: one(users, {
        fields: [facilities.ownerId],
        references: [users.id]
    }),
    userScopes: many(userScopes),
    media: many(media),
}))


export type Facility = InferSelectModel<typeof facilities>;
export type NewFacility = InferInsertModel<typeof facilities>;

