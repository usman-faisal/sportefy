export const dynamic = "force-dynamic";

import { venueService } from "@/lib/api/services";
import { VenueDetailShared } from "@/components/common/venues/venue-detail-shared";
import { notFound, redirect } from "next/navigation";

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

  // Check if venue is a gym (non-time-bound with single sport)
  if (venue.sports && venue.sports.length === 1) {
    const sport = venue.sports[0];
    if (sport.timeBound === false) {
      redirect(`/dashboard/admin/venues/${venue.id}/gym`);
    }
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
