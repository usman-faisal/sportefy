ALTER TYPE "public"."transaction_type" ADD VALUE 'transfer_in';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'transfer_out';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "notes" text;