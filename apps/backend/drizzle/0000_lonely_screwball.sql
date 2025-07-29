CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending_payment', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."scope_role" AS ENUM('moderator', 'owner');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');--> statement-breakpoint
CREATE TYPE "public"."availability" AS ENUM('active', 'inactive', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."space_type" AS ENUM('indoor', 'outdoor');--> statement-breakpoint
CREATE TYPE "public"."media_entity_type" AS ENUM('venue', 'facility', 'review', 'payment');--> statement-breakpoint
CREATE TYPE "public"."media_enum" AS ENUM('image', 'video', 'audio');--> statement-breakpoint
CREATE TYPE "public"."slot_event_type" AS ENUM('booking', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."gender_preference" AS ENUM('any', 'male_only', 'female_only');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('open', 'full', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."match_type" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TYPE "public"."skill_level" AS ENUM('any', 'beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."match_player_team" AS ENUM('A', 'B');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"booked_by" uuid NOT NULL,
	"status" "booking_status" DEFAULT 'pending_payment' NOT NULL,
	"total_credits" integer NOT NULL,
	"qr_code" text,
	"check_in_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "bookings_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"name" varchar,
	"description" text,
	"phone_number" varchar(255),
	"cover_url" text,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"avatar_url" text,
	"email" varchar(255) NOT NULL,
	"user_name" varchar(255),
	"gender" "gender",
	"age" integer,
	"address" text,
	"organization" text,
	"phone_number" varchar(255),
	"credits" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_email_unique" UNIQUE("email"),
	CONSTRAINT "profiles_user_name_unique" UNIQUE("user_name"),
	CONSTRAINT "age_check" CHECK ("profiles"."age" > 0 AND "profiles"."age" < 100),
	CONSTRAINT "username_check" CHECK (length("profiles"."user_name") < 16),
	CONSTRAINT "credits_check" CHECK ("profiles"."credits" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_scopes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"venue_id" uuid,
	"facility_id" uuid,
	"role" "scope_role" NOT NULL,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "check_one_scope" CHECK (
            (
                CASE WHEN "user_scopes"."venue_id" IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN "user_scopes"."facility_id" IS NOT NULL THEN 1 ELSE 0 END
            ) = 1
        )
);
--> statement-breakpoint
CREATE TABLE "operating_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" uuid,
	"venue_id" uuid,
	"open_time" time,
	"close_time" time,
	"day_of_week" "day_of_week",
	CONSTRAINT "check_one_parent" CHECK (
            (
                CASE WHEN "operating_hours"."venue_id" IS NOT NULL THEN 1 ELSE 0 END +
                CASE WHEN "operating_hours"."facility_id" IS NOT NULL THEN 1 ELSE 0 END
            ) = 1
        )
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"sport_id" uuid NOT NULL,
	"name" varchar(255),
	"phoneNumber" varchar(255),
	"spaceType" "space_type",
	"availability" "availability",
	"base_price" integer NOT NULL,
	"capacity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"entity_type" "media_entity_type" NOT NULL,
	"media_link" text NOT NULL,
	"media_type" "media_enum" DEFAULT 'image'
);
--> statement-breakpoint
CREATE TABLE "maintenance_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid,
	"reason" text,
	"scheduled_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"event_type" "slot_event_type" NOT NULL,
	"event_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"match_type" "match_type" DEFAULT 'public' NOT NULL,
	"status" "match_status" DEFAULT 'open' NOT NULL,
	"created_by" uuid NOT NULL,
	"player_limit" integer NOT NULL,
	"title" text,
	"gender_preference" "gender_preference" DEFAULT 'any' NOT NULL,
	"skill_level" "skill_level" DEFAULT 'any',
	"min_age" integer,
	"max_age" integer,
	"organization_preference" varchar(255),
	"invite_token" uuid DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "matches_booking_id_unique" UNIQUE("booking_id"),
	CONSTRAINT "matches_invite_token_unique" UNIQUE("invite_token")
);
--> statement-breakpoint
CREATE TABLE "match_players" (
	"match_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"team" "match_player_team",
	CONSTRAINT "match_players_match_id_user_id_pk" PRIMARY KEY("match_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booked_by_users_id_fk" FOREIGN KEY ("booked_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scopes" ADD CONSTRAINT "user_scopes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scopes" ADD CONSTRAINT "user_scopes_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scopes" ADD CONSTRAINT "user_scopes_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scopes" ADD CONSTRAINT "user_scopes_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operating_hours" ADD CONSTRAINT "operating_hours_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operating_hours" ADD CONSTRAINT "operating_hours_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_scheduled_by_users_id_fk" FOREIGN KEY ("scheduled_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;