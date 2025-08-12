export const dynamic = "force-dynamic";

import { VenueEditShared } from "@/components/common/venues/venue-edit-shared";
import {
  venueService,
  sportService,
  operatingHourService,
  facilityMediaService,
} from "@/lib/api/services";
import { Scope } from "@/lib/types";
import { notFound } from "next/navigation";

interface VenueEditPageProps {
  params: Promise<{ venueId: string }>;
}

const VenueEditPage = async ({ params }: VenueEditPageProps) => {
  const resolvedParams = await params;
  const [venue, sports, operatingHours, media] = await Promise.all([
    venueService.getVenue(resolvedParams.venueId),
    sportService.getAllSports(),
    operatingHourService.getOperatingHours(resolvedParams.venueId, Scope.VENUE),
    facilityMediaService.getMedia(resolvedParams.venueId, Scope.VENUE),
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
      backHref={`/dashboard/admin/venues/${venue.id}`}
      userType="admin"
    />
  );
};

export default VenueEditPage;
