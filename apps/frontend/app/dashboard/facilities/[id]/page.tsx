import { Suspense } from "react";
import FacilityDetail from "@/components/common/facilities/facility-detail/facility-detail";
import { facilityService } from "@/lib/api/services";

interface FacilityDetailPageProps {
  params: { id: string };
}

export default async function FacilityDetailPage({ params }: FacilityDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const facility = await facilityService.getFacility(resolvedParams.id);

  if (!facility) {
    return <div className="p-6">Facility not found.</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacilityDetail facility={facility} />
    </Suspense>
  );
} 