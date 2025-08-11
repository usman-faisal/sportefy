export const dynamic = "force-dynamic";

import { FacilityEditForm } from "@/components/common/facilities/facility-edit/faciility-edit-form";
import { facilityService } from "@/lib/api/services";
import { profileService } from "@/lib/api/services";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/staff/facilities/${facility.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Facility
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit {facility.name || "Facility"}
          </h1>
          <p className="text-muted-foreground">Update facility information</p>
        </div>
      </div>

      <FacilityEditForm
        facility={facility}
        initialOperatingHours={facility.operatingHours || []}
        initialMedia={facility.media || []}
      />
    </div>
  );
}
