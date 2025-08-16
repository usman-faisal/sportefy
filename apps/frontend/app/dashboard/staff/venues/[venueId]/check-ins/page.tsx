export const dynamic = "force-dynamic";

import { profileService, venueService, checkInService } from "@/lib/api/services";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect, notFound } from "next/navigation";
import { CheckInsListShared } from "@/components/common/venues/check-ins-list-shared";

interface CheckInsListPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function CheckInsListPage({
  params,
}: CheckInsListPageProps) {
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

    const checkIns = await checkInService.getVenueCheckIns(venue.id);

    return (
      <CheckInsListShared
        venue={venue}
        checkIns={checkIns || []}
        backHref={`/dashboard/staff/venues/${venue.id}`}
        userType="staff"
      />
    );
  } catch (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="border-destructive border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Error Loading Check-ins
            </h2>
            <p className="text-muted-foreground">
              Failed to load check-in data. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }
}