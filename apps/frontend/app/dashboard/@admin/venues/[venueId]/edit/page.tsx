import { VenueEditForm } from "@/components/common/venues/venue-edit/venue-edit-form";
import { venueService, sportService, operatingHourService, facilityMediaService } from "@/lib/api/services";
import { Scope } from "@/lib/types";
import { notFound } from "next/navigation";

interface VenueEditPageProps {
  params: { venueId: string };
}

const VenueEditPage = async ({ params }: VenueEditPageProps) => {
  const [venue, sports, operatingHours, media] = await Promise.all([
    venueService.getVenue(params.venueId),
    sportService.getAllSports(),
    operatingHourService.getOperatingHours(params.venueId, Scope.VENUE),
    facilityMediaService.getMedia(params.venueId, Scope.VENUE),
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