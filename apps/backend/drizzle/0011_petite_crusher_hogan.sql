CREATE TYPE "public"."match_join_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "match_join_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"requester_id" uuid NOT NULL,
	"preferred_team" "match_player_team",
	"status" "match_join_request_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "match_join_requests" ADD CONSTRAINT "match_join_requests_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_join_requests" ADD CONSTRAINT "match_join_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_join_requests" ADD CONSTRAINT "match_join_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;