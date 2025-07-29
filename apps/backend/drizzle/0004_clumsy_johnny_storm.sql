CREATE TYPE "public"."sport_type" AS ENUM('single', 'multiple');--> statement-breakpoint
CREATE TABLE "check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"venue_id" uuid NOT NULL,
	"check_in_time" timestamp with time zone DEFAULT now() NOT NULL,
	"check_out_time" timestamp with time zone,
	"duration_in_minutes" integer
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "check_ins" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "sports" ADD COLUMN "time_bound" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "sports" ADD COLUMN "sport_type" "sport_type";--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "sport_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "check_ins_check" CHECK ("profiles"."check_ins" >= 0);