export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { facilityService } from "@/lib/api/services";
import { profileService } from "@/lib/api/services";
import { notFound, redirect } from "next/navigation";
import { FacilityEditShared } from "@/components/common/facilities/facility-edit-shared";

interface EditFacilityPageProps {
  params: Promise<{
    id: string;
  }>;
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

export default async function StaffEditFacilityPage({
  params,
}: EditFacilityPageProps) {
  const resolvedParams = await params;
  const facilityId = resolvedParams.id;
  
  // Check if staff has access to this facility
  const hasAccess = await checkStaffAccess(facilityId);
  if (!hasAccess) {
    redirect("/dashboard/staff/facilities");
  }
  
  const facility = await facilityService.getFacility(facilityId);
  if (!facility) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacilityEditShared
        facility={facility}
        backHref={`/dashboard/staff/facilities/${facility.id}`}
        userType="staff"
      />
    </Suspense>
  );
}
