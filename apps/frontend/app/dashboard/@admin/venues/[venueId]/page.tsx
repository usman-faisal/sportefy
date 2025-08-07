import { venueService } from "@/lib/api/services";
import { VenueDetailClient } from "@/components/common/venues/venue-detail/venue-detail-client";
import { notFound } from "next/navigation";

interface VenueDetailPageProps {
  params: { venueId: string };
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const venue = await venueService.getVenue(params.venueId);

  if (!venue) {
    notFound();
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VenueDetailClient venue={venue} />
      </div>
    </div>
  );
}