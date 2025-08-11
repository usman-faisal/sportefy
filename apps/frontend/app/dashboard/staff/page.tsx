export const dynamic = "force-dynamic";

import { profileService } from "@/lib/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Users, Calendar, Clock, Star } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Venue, UserScope } from "@sportefy/db-types";

interface FacilityWithVenues {
  id: string;
  name: string;
  role: string;
  venues: Array<Venue & { role: string }>;
  isStandaloneVenue?: boolean;
}

export default async function StaffPage() {
  const profile = await profileService.getProfileWithScopes();
  
  if (!profile) {
    redirect("/auth/login");
  }

  const userScopes = profile.userScopes || [];
  
  const facilityScopes = userScopes.filter(scope => scope.facilityId && scope.facility);
  const venueScopes = userScopes.filter(scope => scope.venueId && scope.venue);

  const uniqueFacilities = new Map<string, FacilityWithVenues>();
  facilityScopes.forEach(scope => {
    if (scope.facility) {
      uniqueFacilities.set(scope.facility.id, {
        id: scope.facility.id,
        name: scope.facility.name || "Unnamed Facility",
        role: scope.role,
        venues: []
      });
    }
  });

  venueScopes.forEach(scope => {
    if (scope.venue && scope.venue.facilityId) {
      const facility = uniqueFacilities.get(scope.venue.facilityId);
      if (facility) {
        facility.venues.push({
          ...scope.venue,
          role: scope.role
        });
      } else {
        // Venue without facility, create standalone entry
        if (!uniqueFacilities.has(scope.venue.id)) {
          uniqueFacilities.set(scope.venue.id, {
            id: scope.venue.id,
            name: scope.venue.name || "Unnamed Venue",
            role: scope.role,
            venues: [{
              ...scope.venue,
              role: scope.role
            }],
            isStandaloneVenue: true
          });
        }
      }
    }
  });

  const facilities: FacilityWithVenues[] = Array.from(uniqueFacilities.values());

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">
          Staff Dashboard
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Welcome to your facility management dashboard. Here you can manage the facilities and venues you have access to.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facilities.length}</div>
            <p className="text-xs text-muted-foreground">
              Facilities you moderate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {venueScopes.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Venues you manage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userScopes.length > 0 ? userScopes[0].role : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              Primary role
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facilities and Venues List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">My Facilities & Venues</h2>
        
        {facilities.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No facilities assigned</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't been assigned to any facilities or venues yet.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {facilities.map((facility) => (
              <Card key={facility.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">
                          {facility.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">
                            {facility.role}
                          </Badge>
                          {facility.isStandaloneVenue && (
                            <Badge variant="outline">Standalone Venue</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                                             <Button
                         variant="outline"
                         size="sm"
                         asChild
                       >
                         <Link href={`/dashboard/staff/facilities`}>
                           View All
                         </Link>
                       </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {facility.venues && facility.venues.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Venues</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                 {facility.venues.map((venue) => (
                           <Card key={venue.id} className="border border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-green-600" />
                                  <h5 className="font-medium text-sm">{venue.name}</h5>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {venue.role}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-3 w-3" />
                                  <span>Capacity: {venue.capacity}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Star className="h-3 w-3" />
                                  <span>Base Price: ${venue.basePrice}</span>
                                </div>
                              </div>
                              
                                                             <div className="mt-3 flex space-x-2">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className="flex-1"
                                   asChild
                                 >
                                   <Link href={`/dashboard/staff/venues`}>
                                     View All
                                   </Link>
                                 </Button>
                               </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        No venues assigned to this facility
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            asChild
          >
            <Link href="/dashboard/staff/bookings">
              <Calendar className="h-6 w-6" />
              <span>View Bookings</span>
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            asChild
          >
            <Link href="/dashboard/staff/check-in">
              <Clock className="h-6 w-6" />
              <span>Check-In Scanner</span>
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            asChild
          >
            <Link href="/dashboard/staff/reports">
              <Star className="h-6 w-6" />
              <span>View Reports</span>
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            asChild
          >
            <Link href="/dashboard/staff/facilities">
              <Building2 className="h-6 w-6" />
              <span>My Facilities</span>
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            asChild
          >
            <Link href="/dashboard/staff/venues">
              <MapPin className="h-6 w-6" />
              <span>My Venues</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
