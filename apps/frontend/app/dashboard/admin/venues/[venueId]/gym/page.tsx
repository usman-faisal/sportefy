export const dynamic = "force-dynamic";

import { venueService, checkInService } from "@/lib/api/services";
import { notFound, redirect } from "next/navigation";
import { isGym } from "@/lib/utils/venue-utils";
import { GymDetailShared } from "@/components/common/venues/gym-detail-shared";

interface GymDetailPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function GymDetailPage({
  params,
}: GymDetailPageProps) {
  const resolvedParams = await params;
  const venue = await venueService.getVenue(resolvedParams.venueId);

  if (!venue) {
    notFound();
  }

  // Redirect to regular venue page if this is not a gym
  if (!isGym(venue)) {
    redirect(`/dashboard/admin/venues/${venue.id}`);
  }

  const checkInCount = await checkInService.getVenueCheckInCount(venue.id);

  return (
    <GymDetailShared
      venue={venue}
      checkInCount={checkInCount?.activeCheckIns || 0}
      backHref="/dashboard/admin/venues"
      editHref={`/dashboard/admin/venues/${venue.id}/edit`}
      checkInsHref={`/dashboard/admin/venues/${venue.id}/check-ins`}
      showDeleteButton={true}
      userType="admin"
    />
  );
}