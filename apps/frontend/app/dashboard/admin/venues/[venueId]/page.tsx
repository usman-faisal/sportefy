export const dynamic = "force-dynamic";

import { venueService } from "@/lib/api/services";
import { VenueDetailShared } from "@/components/common/venues/venue-detail-shared";
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
    <VenueDetailShared
      venue={venue}
      backHref="/dashboard/admin/venues"
      editHref={`/dashboard/admin/venues/${venue.id}/edit`}
      showDeleteButton={true}
      userType="admin"
    />
  );
}
