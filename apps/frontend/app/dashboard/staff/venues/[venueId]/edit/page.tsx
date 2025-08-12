export const dynamic = "force-dynamic";

import { profileService, venueService, sportService, operatingHourService, facilityMediaService } from "@/lib/api/services";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect, notFound } from "next/navigation";
import { VenueEditShared } from "@/components/common/venues/venue-edit-shared";
import { Scope } from "@/lib/types";

interface VenueEditPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function VenueEditPage({
  params,
}: VenueEditPageProps) {
  const { venueId } = await params;

  const profile = await profileService.getProfileWithScopes();
  if (!profile) {
    redirect("/auth/login");
  }

  const permissions = new PermissionChecker(profile);
  
  // Check if user can access this venue
  if (!permissions.canModerateVenue(venueId)) {
    redirect("/dashboard");
  }

  try {
    const [venue, sports, operatingHours, media] = await Promise.all([
      venueService.getVenue(venueId),
      sportService.getAllSports(),
      operatingHourService.getOperatingHours(venueId, Scope.VENUE),
      facilityMediaService.getMedia(venueId, Scope.VENUE),
    ]);

    if (!venue) {
      notFound();
    }

    return (
      <VenueEditShared
        venue={venue}
        sports={sports || []}
        operatingHours={operatingHours || []}
        media={media || []}
        backHref={`/dashboard/staff/venues/${venueId}`}
        userType="staff"
      />
    );
  } catch (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="border-destructive border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Error Loading Venue
            </h2>
            <p className="text-sm text-muted-foreground">
              Failed to load venue data. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
