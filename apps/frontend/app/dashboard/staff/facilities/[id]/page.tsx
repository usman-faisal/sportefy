export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { facilityService } from "@/lib/api/services";
import { profileService } from "@/lib/api/services";
import { notFound, redirect } from "next/navigation";
import { FacilityDetailShared } from "@/components/common/facilities/facility-detail-shared";

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
    return { facility };
  } catch (error) {
    console.error("Error fetching facility:", error);
    return null;
  }
}

async function checkStaffAccess(facilityId: string) {
  try {
    const profile = await profileService.getProfileWithScopes();
    if (!profile) {
      return false;
    }
    
    const userScopes = profile.userScopes || [];
    return userScopes.some(scope => 
      scope.facilityId === facilityId || 
      (scope.venueId && scope.venue?.facilityId === facilityId)
    );
  } catch (error) {
    console.error("Error checking staff access:", error);
    return false;
  }
}

export default async function StaffFacilityDetailPage({
  params,
}: FacilityDetailPageProps) {
  const { id } = await params;
  
  // Check if staff has access to this facility
  const hasAccess = await checkStaffAccess(id);
  if (!hasAccess) {
    redirect("/dashboard/staff/facilities");
  }
  
  const data = await getFacilityData(id);
  if (!data) {
    notFound();
  }

  const { facility } = data;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacilityDetailShared
        facility={facility}
        backHref="/dashboard/staff/facilities"
        editHref={`/dashboard/staff/facilities/${facility.id}/edit`}
        showDeleteButton={false}
        userType="staff"
      />
    </Suspense>
  );
}
