ALTER TABLE "bookings" DROP CONSTRAINT "bookings_qr_code_unique";--> statement-breakpoint
ALTER TABLE "check_ins" ADD COLUMN "booking_id" uuid;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "qr_code";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "check_in_time";--> statement-breakpoint
ALTER TABLE "match_players" DROP COLUMN "checked_in_at";