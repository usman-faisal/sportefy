ALTER TABLE "facilities" DROP CONSTRAINT "facilities_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "facilities" DROP COLUMN "owner_id";