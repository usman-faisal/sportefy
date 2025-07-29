ALTER TABLE "venues" ADD COLUMN "total_reviews" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "venues" ADD COLUMN "rating" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "total_reviews";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "rating";