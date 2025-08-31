ALTER TABLE "venues" ALTER COLUMN "rating" SET DATA TYPE numeric(3, 2);--> statement-breakpoint
ALTER TABLE "venues" ALTER COLUMN "rating" DROP DEFAULT;