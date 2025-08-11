export const dynamic = "force-dynamic";

import { FacilityEditPage } from "@/components/common/facilities/facility-edit/facility-edit-page";
import { facilityService } from "@/lib/api/services";
import { notFound } from "next/navigation";

interface EditFacilityPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditFacilityPage({
  params,
}: EditFacilityPageProps) {
  const resolvedParams = await params;
  const facility = await facilityService.getFacility(resolvedParams.id);

  if (!facility) {
    notFound();
  }

  return <FacilityEditPage facility={facility} />;
}
