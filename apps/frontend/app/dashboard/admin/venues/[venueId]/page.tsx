export const dynamic = "force-dynamic";

import { venueService } from "@/lib/api/services";
import { VenueDetailShared } from "@/components/common/venues/venue-detail-shared";
import { notFound, redirect } from "next/navigation";
import { isGym } from "@/lib/utils/venue-utils";

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

  // Redirect to gym page if this venue is a gym
  if (isGym(venue)) {
    redirect(`/dashboard/admin/venues/${venue.id}/gym`);
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
