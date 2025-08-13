export const dynamic = "force-dynamic";

import { profileService, venueService } from "@/lib/api/services";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MaintenanceScheduleForm } from "../components/maintenance-schedule-form";

interface AdminNewMaintenancePageProps {
  params: Promise<{ venueId: string }>;
}

export default async function AdminNewMaintenancePage({
  params,
}: AdminNewMaintenancePageProps) {
  const { venueId } = await params;

  const profile = await profileService.getProfileWithScopes();
  if (!profile) {
    redirect("/auth/login");
  }

  // Check if user is admin
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  try {
    const venue = await venueService.getVenue(venueId);
    if (!venue) {
      notFound();
    }

    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/dashboard/admin/venues/${venueId}/maintenance`}>
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
              venueId={venueId}
              venueName={venue.name ?? ''}
              userType="admin"
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading venue:", error);
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="border-destructive border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Error Loading Venue
            </h2>
            <p className="text-muted-foreground">
              Failed to load venue data. Please try refreshing the page.
            </p>
            <div className="mt-4">
              <Link href={`/dashboard/admin/venues/${venueId}/maintenance`}>
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
