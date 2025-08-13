export const dynamic = "force-dynamic";

import { profileService, venueService } from "@/lib/api/services";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MaintenanceSchedulesClient } from "./components/maintenance-schedules-client";
import { getMaintenanceSchedules } from "@/lib/actions/maintenance-schedule-actions";

interface MaintenancePageProps {
  params: Promise<{ venueId: string }>;
}

export default async function MaintenancePage({
  params,
}: MaintenancePageProps) {
  const { venueId } = await params;

  const profile = await profileService.getProfileWithScopes();
  if (!profile) {
    redirect("/auth/login");
  }

  const permissions = new PermissionChecker(profile);
  
  if (!permissions.canModerateVenue(venueId)) {
    redirect("/dashboard");
  }

  try {
    // Fetch venue details and maintenance schedules in parallel
    const [venue, schedulesResult] = await Promise.all([
      venueService.getVenue(venueId),
      getMaintenanceSchedules(venueId)
    ]);

    if (!venue) {
      notFound();
    }

    const schedules = schedulesResult.success ? schedulesResult.data || [] : [];

    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/dashboard/staff/venues/${venueId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Venue
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Maintenance Schedules
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage maintenance schedules for {venue.name}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <MaintenanceSchedulesClient
              initialSchedules={schedules}
              venueId={venueId}
              venueName={venue.name ?? ''}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading maintenance schedules:", error);
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="border-destructive border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Error Loading Maintenance Schedules
            </h2>
            <p className="text-muted-foreground">
              Failed to load maintenance schedules. Please try refreshing the page.
            </p>
            <div className="mt-4">
              <Link href={`/dashboard/staff/venues/${venueId}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Venue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
