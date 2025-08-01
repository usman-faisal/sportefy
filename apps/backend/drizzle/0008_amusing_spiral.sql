ALTER TABLE "venues" DROP CONSTRAINT "venues_facility_id_facilities_id_fk";
--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;