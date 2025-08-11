export const dynamic = "force-dynamic";

import { facilityService } from "@/lib/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, UserPlus } from "lucide-react";
import { notFound } from "next/navigation";
import FacilityUserScopesClient from "./components/facility-user-scopes-client";
import { getFacilityUserScopes } from "@/lib/actions/user-scope-actions";

interface FacilityUserScopesPageProps {
  params: Promise<{ facilityId: string }>;
}

export default async function FacilityUserScopesPage({
  params,
}: FacilityUserScopesPageProps) {
  const resolvedParams = await params;
  const facility = await facilityService.getFacility(resolvedParams.facilityId);

  if (!facility) {
    notFound();
  }

  const userScopesResult = await getFacilityUserScopes(resolvedParams.facilityId);
  const userScopes = userScopesResult.success ? userScopesResult.data : [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {facility.name} - User Scopes
            </h2>
            <p className="text-muted-foreground">
              Manage moderators and owners for this facility
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Moderator
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Current Moderators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Moderators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FacilityUserScopesClient 
                facility={facility} 
                userScopes={userScopes || []}
              />
            </CardContent>
          </Card>

          {/* Facility Info */}
          <Card>
            <CardHeader>
              <CardTitle>Facility Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium">Name</h4>
                  <p className="text-sm text-muted-foreground">{facility.name}</p>
                </div>
                <div>
                  <h4 className="font-medium">Address</h4>
                  <p className="text-sm text-muted-foreground">{facility.address}</p>
                </div>
                <div>
                  <h4 className="font-medium">Phone</h4>
                  <p className="text-sm text-muted-foreground">{facility.phoneNumber}</p>
                </div>
                <div>
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{facility.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
