import {
  facilityService,
  operatingHourService,
  facilityMediaService,
} from "@/lib/api/services";
import { FacilityEditForm } from "@/components/common/facilities/facility-edit/faciility-edit-form";
import { Suspense } from "react";
import { Scope } from "@/lib/types";

export default async function EditFacilityPage({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  console.log(resolvedParams.id, "resolvedParams.id");

  if (!resolvedParams.id) {
    console.error("No facility ID provided");
    return <div className="p-6 text-red-500">Invalid facility ID</div>;
  }

  const [facility, operatingHours, media] = await Promise.all([
    facilityService.getFacility(resolvedParams.id),
    operatingHourService.getOperatingHours(resolvedParams.id, Scope.FACILITY),
    facilityMediaService.getMedia(resolvedParams.id, Scope.FACILITY),
  ]);

  if (!facility) {
    return <div className="p-6 text-red-500">Facility not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Facility</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <FacilityEditForm
          facility={facility}
          initialOperatingHours={
            Array.isArray(operatingHours) ? operatingHours : []
          }
          initialMedia={Array.isArray(media) ? media : []}
        />
      </Suspense>
    </div>
  );
}
