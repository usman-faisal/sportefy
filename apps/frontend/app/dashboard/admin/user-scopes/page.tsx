export const dynamic = "force-dynamic";

import { facilityService, venueService } from "@/lib/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, MapPin } from "lucide-react";
import Link from "next/link";

export default async function UserScopesPage() {
  const facilities = await facilityService.getAllFacilities();
  const venues = await venueService.getAllVenues();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Scopes</h2>
            <p className="text-muted-foreground">
              Manage user permissions for facilities and venues
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Facilities Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5" />
              <h3 className="text-xl font-semibold">Facilities</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {facilities?.data?.map((facility) => (
                <Card key={facility.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                      <Badge variant="secondary">
                        {facility.venue ? "Has Venues" : "No Venues"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {facility.address}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Manage Scopes</span>
                      </div>
                      <Link href={`/dashboard/admin/user-scopes/facilities/${facility.id}`}>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <Card className="col-span-full">
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No facilities found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Venues Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              <h3 className="text-xl font-semibold">Venues</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {venues?.data?.map((venue) => (
                <Card key={venue.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{venue.name}</CardTitle>
                      <Badge variant="outline">
                        {venue.facilityId ? "Facility Venue" : "Standalone"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {venue.address}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Manage Scopes</span>
                      </div>
                      <Link href={`/dashboard/admin/user-scopes/venues/${venue.id}`}>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <Card className="col-span-full">
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No venues found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
