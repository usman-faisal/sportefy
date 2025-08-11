export const dynamic = "force-dynamic";

import { venueService } from "@/lib/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus } from "lucide-react";
import { notFound } from "next/navigation";
import VenueUserScopesClient from "./components/venue-user-scopes-client";
import { getVenueUserScopes } from "@/lib/actions/user-scope-actions";

interface VenueUserScopesPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function VenueUserScopesPage({
  params,
}: VenueUserScopesPageProps) {
  const resolvedParams = await params;
  const venue = await venueService.getVenue(resolvedParams.venueId);

  if (!venue) {
    notFound();
  }

  const userScopesResult = await getVenueUserScopes(resolvedParams.venueId);
  const userScopes = userScopesResult.success ? userScopesResult.data : [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {venue.name} - User Scopes
            </h2>
            <p className="text-muted-foreground">
              Manage moderators for this venue
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
              <VenueUserScopesClient 
                venue={venue} 
                userScopes={userScopes || []}
              />
            </CardContent>
          </Card>

          {/* Venue Info */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium">Name</h4>
                  <p className="text-sm text-muted-foreground">{venue.name}</p>
                </div>
                <div>
                  <h4 className="font-medium">Address</h4>
                  <p className="text-sm text-muted-foreground">{venue.address}</p>
                </div>
                <div>
                  <h4 className="font-medium">Base Price</h4>
                  <p className="text-sm text-muted-foreground">${venue.basePrice}</p>
                </div>
                <div>
                  <h4 className="font-medium">Capacity</h4>
                  <p className="text-sm text-muted-foreground">{venue.capacity} people</p>
                </div>
                {venue.facilityId && (
                  <div>
                    <h4 className="font-medium">Facility ID</h4>
                    <p className="text-sm text-muted-foreground">{venue.facilityId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
