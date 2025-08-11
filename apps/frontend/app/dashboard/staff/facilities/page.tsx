export const dynamic = "force-dynamic";

import { profileService } from "@/lib/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Phone, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StaffFacilitiesPage() {
  const profile = await profileService.getProfileWithScopes();
  
  if (!profile) {
    redirect("/auth/login");
  }

  const userScopes = profile.userScopes || [];
  const facilityScopes = userScopes.filter(scope => scope.facilityId && scope.facility);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">
          My Facilities
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Manage the facilities you have access to as a staff member.
        </p>
      </div>

      {facilityScopes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No facilities assigned</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't been assigned to any facilities yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilityScopes.map((scope) => {
            const facility = scope.facility!;
            return (
              <Card key={facility.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">
                          {facility.name || "Unnamed Facility"}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {scope.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {facility.description && (
                      <p className="text-sm text-gray-600">
                        {facility.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {facility.address && (
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{facility.address}</span>
                        </div>
                      )}
                      
                      {facility.phoneNumber && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{facility.phoneNumber}</span>
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
                        <Link href={`/dashboard/staff/facilities/${facility.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link href={`/dashboard/staff/facilities/${facility.id}/edit`}>
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
