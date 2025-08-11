export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { facilityService } from "@/lib/api/services";
import { profileService } from "@/lib/api/services";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Users, Calendar, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OperatingHours } from "@/components/common/operating-hours/operating-hours";
import { Media } from "@/components/common/media/media";

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
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/staff/facilities">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Facilities
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {facility.name || "Facility Details"}
              </h1>
              <p className="text-muted-foreground">
                Facility information and management
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/staff/facilities/${facility.id}/edit`}>
                Edit Facility
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Name</h4>
                    <p className="text-lg font-medium">{facility.name || "Unnamed Facility"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Phone</h4>
                    <p className="text-lg">{facility.phoneNumber || "Not provided"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
                    <p className="text-lg">{facility.address || "Address not provided"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                    <p className="text-lg">{facility.description || "No description available"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venues */}
            {facility.venue ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Venues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">{facility.venue.name || "Unnamed Venue"}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>Capacity: {facility.venue.capacity}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="h-4 w-4" />
                              <span>Base Price: ${facility.venue.basePrice}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/staff/venues/${facility.venue.id}`}>
                          View Venue
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Venues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No venues assigned to this facility
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Operating Hours */}
            {facility.operatingHours && facility.operatingHours.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OperatingHours operatingHours={facility.operatingHours} />
                </CardContent>
              </Card>
            )}

            {/* Media */}
            {facility.media && facility.media.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Media & Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Media media={facility.media} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Venues</span>
                    <span className="font-medium">{facility.venue ? 1 : 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Operating Days</span>
                    <span className="font-medium">
                      {facility.operatingHours ? facility.operatingHours.length : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Media Files</span>
                    <span className="font-medium">
                      {facility.media ? facility.media.length : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/dashboard/staff/facilities/${facility.id}/edit`}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Edit Facility
                    </Link>
                  </Button>
                  {facility.venue ? (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/dashboard/staff/venues/${facility.venue.id}`}>
                        <MapPin className="h-4 w-4 mr-2" />
                        View Venue
                      </Link>
                    </Button>
                  ) : null}
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/staff/bookings">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Bookings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
