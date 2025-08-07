import { facilityService, sportService } from "@/lib/api/services";
import { VenueCreateForm } from "@/components/common/venues/venue-create/venue-create-form";

const VenueCreatePage = async () => {
  const sports = await sportService.getAllSports();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VenueCreateForm
          sports={sports || []}
        />
      </div>
    </div>
  );
};

export default VenueCreatePage;