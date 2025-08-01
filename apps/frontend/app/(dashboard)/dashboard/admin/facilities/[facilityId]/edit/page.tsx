import { FacilityEditPage } from "@/components/common/facilities/facility-edit/facility-edit-page";
import { facilityService } from "@/lib/api/services";
import { notFound } from "next/navigation";

interface EditFacilityPageProps {
  params: {
    facilityId: string;
  };
}

export default async function EditFacilityPage({ params }: EditFacilityPageProps) {
    params = await params
  const facility = await facilityService.getFacility(params.facilityId);

  if (!facility) {
    notFound();
  }

  return <FacilityEditPage facility={facility} />;
}