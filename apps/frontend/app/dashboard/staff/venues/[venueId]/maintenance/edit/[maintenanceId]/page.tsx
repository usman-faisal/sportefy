export const dynamic = "force-dynamic";

import { profileService, venueService, maintenanceScheduleService } from "@/lib/api/services";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MaintenanceScheduleForm } from "../../components/maintenance-schedule-form";

interface EditMaintenancePageProps {
  params: Promise<{ venueId: string; maintenanceId: string }>;
}

export default async function EditMaintenancePage({
  params,
}: EditMaintenancePageProps) {
  const { venueId, maintenanceId } = await params;

  const profile = await profileService.getProfileWithScopes();
  if (!profile) {
    redirect("/auth/login");
  }

  const permissions = new PermissionChecker(profile);
  
  if (!permissions.canModerateVenue(venueId)) {
    redirect("/dashboard");
  }

  try {
    // Fetch venue and maintenance schedule details
    const [venue, schedules] = await Promise.all([
      venueService.getVenue(venueId),
      maintenanceScheduleService.getMaintenanceSchedules(venueId)
    ]);

    if (!venue) {
      notFound();
    }

    const maintenanceSchedule = schedules.find(s => s.id === maintenanceId);
    if (!maintenanceSchedule) {
      notFound();
    }

    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/dashboard/staff/venues/${venueId}/maintenance`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Maintenance Schedules
                </Button>
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border p-6">
            <MaintenanceScheduleForm
              initialData={maintenanceSchedule}
              venueId={venueId}
              venueName={venue.name ?? ''}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading maintenance schedule:", error);
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="border-destructive border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Error Loading Maintenance Schedule
            </h2>
            <p className="text-muted-foreground">
              Failed to load maintenance schedule data. Please try refreshing the page.
            </p>
            <div className="mt-4">
              <Link href={`/dashboard/staff/venues/${venueId}/maintenance`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Maintenance Schedules
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
