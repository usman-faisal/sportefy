export const dynamic = "force-dynamic";

import { profileService } from "@/lib/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Star, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StaffVenuesPage() {
  const profile = await profileService.getProfileWithScopes();
  
  if (!profile) {
    redirect("/auth/login");
  }

  const userScopes = profile.userScopes || [];
  const venueScopes = userScopes.filter(scope => scope.venueId && scope.venue);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">
          My Venues
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Manage the venues you have access to as a staff member.
        </p>
      </div>

      {venueScopes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No venues assigned</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't been assigned to any venues yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venueScopes.map((scope) => {
            const venue = scope.venue!;
            return (
              <Card key={venue.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <CardTitle className="text-lg">
                          {venue.name || "Unnamed Venue"}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">
                            {scope.role}
                          </Badge>
                          {venue.spaceType && (
                            <Badge variant="outline" className="text-xs">
                              {venue.spaceType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Capacity: {venue.capacity}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span>Base Price: ${venue.basePrice}</span>
                      </div>
                      
                      {venue.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{venue.address}</span>
                        </div>
                      )}
                      
                      {venue.availability && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Status: {venue.availability}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link href={`/dashboard/staff/venues/${venue.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link href={`/dashboard/staff/venues/${venue.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
