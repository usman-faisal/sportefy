import { VenueEditForm } from "@/components/common/venues/venue-edit/venue-edit-form";
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
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VenueEditForm
          venue={venue}
          sports={sports || []}
          initialOperatingHours={operatingHours || []}
          initialMedia={media || []}
        />
      </div>
    </div>
  );
};

export default VenueEditPage;
