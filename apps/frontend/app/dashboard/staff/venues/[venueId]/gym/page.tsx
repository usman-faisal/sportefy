export const dynamic = "force-dynamic";

import { profileService, venueService, checkInService } from "@/lib/api/services";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect, notFound } from "next/navigation";
import { isGym } from "@/lib/utils/venue-utils";
import { GymDetailShared } from "@/components/common/venues/gym-detail-shared";

interface GymDetailPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function GymDetailPage({
  params,
}: GymDetailPageProps) {
  const { venueId } = await params;

  const profile = await profileService.getProfileWithScopes();
  if (!profile) {
    redirect("/auth/login");
  }

  const permissions = new PermissionChecker(profile);
  
  if (!permissions.canModerateVenue(venueId)) {
    redirect("/dashboard");
  }

  try {
    const venue = await venueService.getVenue(venueId);
    if (!venue) {
      notFound();
    }

    // Redirect to regular venue page if this is not a gym
    if (!isGym(venue)) {
      redirect(`/dashboard/staff/venues/${venue.id}`);
    }

    const checkInCount = await checkInService.getVenueCheckInCount(venue.id);

    return (
      <GymDetailShared
        venue={venue}
        checkInCount={checkInCount?.activeCheckIns || 0}
        backHref="/dashboard/staff/venues"
        editHref={`/dashboard/staff/venues/${venue.id}/edit`}
        checkInsHref={`/dashboard/staff/venues/${venue.id}/check-ins`}
        showDeleteButton={false}
        userType="staff"
      />
    );
  } catch (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="border-destructive border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Error Loading Gym
            </h2>
            <p className="text-muted-foreground">
              Failed to load gym data. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }
}