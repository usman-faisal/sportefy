export const dynamic = "force-dynamic";

import { profileService } from "@/lib/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Star, ArrowLeft, Filter } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StaffBookingsClient } from "./components/staff-bookings-client";
import { getStaffBookings, getStaffBookingStats } from "@/lib/actions/booking-actions";

export default async function StaffBookingsPage() {
  const profile = await profileService.getProfileWithScopes();
  
  if (!profile) {
    redirect("/auth/login");
  }

  const userScopes = profile.userScopes || [];
  
  // Check if staff has any facilities or venues to manage
  const hasAccess = userScopes.some(scope => 
    scope.facilityId || scope.venueId
  );
  
  if (!hasAccess) {
    redirect("/dashboard/staff");
  }

  // Get accessible facility and venue IDs
  const accessibleFacilityIds = userScopes
    .filter(scope => scope.facilityId)
    .map(scope => scope.facilityId!);

  const accessibleVenueIds = userScopes
    .filter(scope => scope.venueId)
    .map(scope => scope.venueId!);

  // Fetch initial data
  const [bookingsResult, statsResult] = await Promise.all([
    getStaffBookings({ facilityIds: accessibleFacilityIds }),
    getStaffBookingStats()
  ]);

  const bookings = bookingsResult.data || [];
  const stats = statsResult.data || null;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-6 text-gray-900">
              My Bookings
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Manage bookings for the facilities and venues you moderate.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/staff">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total credits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Suspense fallback={<div>Loading bookings...</div>}>
        <StaffBookingsClient 
          userScopes={userScopes} 
          initialBookings={bookings}
          initialStats={stats}
        />
      </Suspense>
    </div>
  );
}
