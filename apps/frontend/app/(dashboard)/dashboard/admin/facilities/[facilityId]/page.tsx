export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { facilityService } from "@/lib/api/services";
import { notFound } from "next/navigation";
import FacilityDetail from "@/components/common/facilities/facility-detail/facility-detail";

interface FacilityDetailPageProps {
  params: Promise<{
    facilityId: string;
  }>;
}

async function getFacilityData(facilityId: string) {
  try {
    const facility = await facilityService.getFacility(facilityId);

    if (!facility) {
      return null;
    }

    return {
      facility,
    };
  } catch (error) {
    console.error("Error fetching facility:", error);
    return null;
  }
}

export default async function FacilityDetailPage({
  params,
}: FacilityDetailPageProps) {
  const { facilityId } = await params;
  const data = await getFacilityData(facilityId);

  if (!data) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacilityDetail facility={data.facility} />
    </Suspense>
  );
}
