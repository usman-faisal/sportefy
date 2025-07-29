CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "review_rating_check" CHECK (("reviews"."rating" >= 1 AND "reviews"."rating" <= 5))
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "total_reviews" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "rating" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" DROP COLUMN "duration_in_minutes";