export const dynamic = "force-dynamic";

import { VenueClient } from "@/components/common/venues/client";
import { VenueColumn } from "@/components/common/venues/columns";
import { venueService } from "@/lib/api/services";
import { format } from "date-fns";

export default async function VenuesPage() {
  const venues = await venueService.getAllVenues()
  const formattedVenues: VenueColumn[] = venues?.data.map((item) => ({
    id: item.id,
    name: item.name ?? "No Name",
    facilityId: item.facilityId,
    facilityName: "No Facility", // TODO: Include facility relation in backend or make separate call
    address: item.address ?? "No Address",
    availability: item.availability ?? 'inactive',
    createdAt: item.createdAt ? format(new Date(item.createdAt), "MMMM do, yyyy") : "N/A",
  })) || [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VenueClient data={formattedVenues} />
      </div>
    </div>
  );
}