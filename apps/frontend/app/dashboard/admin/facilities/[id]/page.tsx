export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { facilityService } from "@/lib/api/services";
import { notFound } from "next/navigation";
import FacilityDetail from "@/components/common/facilities/facility-detail/facility-detail";

interface FacilityDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getFacilityData(id: string) {
  try {
    const facility = await facilityService.getFacility(id);

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
  const { id } = await params;
  const data = await getFacilityData(id);

  if (!data) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacilityDetail facility={data.facility} />
    </Suspense>
  );
}
