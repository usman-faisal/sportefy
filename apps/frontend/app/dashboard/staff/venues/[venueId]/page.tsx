export const dynamic = "force-dynamic";

import { profileService, venueService } from "@/lib/api/services";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect, notFound } from "next/navigation";
import { VenueDetailShared } from "@/components/common/venues/venue-detail-shared";

interface VenueDetailPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function VenueDetailPage({
  params,
}: VenueDetailPageProps) {
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

    return (
      <VenueDetailShared
        venue={venue}
        backHref="/dashboard/staff/venues"
        editHref={`/dashboard/staff/venues/${venue.id}/edit`}
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
              Error Loading Venue
            </h2>
            <p className="text-muted-foreground">
              Failed to load venue data. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
