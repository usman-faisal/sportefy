export const dynamic = "force-dynamic";

import { venueService } from "@/lib/api/services";
import { VenueDetailClient } from "@/components/common/venues/venue-detail/venue-detail-client";
import { notFound } from "next/navigation";

interface VenueDetailPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function VenueDetailPage({
  params,
}: VenueDetailPageProps) {
  const resolvedParams = await params;
  const venue = await venueService.getVenue(resolvedParams.venueId);

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
