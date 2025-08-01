import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone } from "lucide-react";
import { FacilityDetails } from "@/lib/api/types";

interface FacilityVenuesProps {
  venue: FacilityDetails['venue'];
}

export function FacilityVenues({ venue }: FacilityVenuesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Venues</CardTitle>
      </CardHeader>
      <CardContent>
        {venue ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{venue.name}</h4>
                <Badge variant={venue.availability === 'active' ? 'default' : 'secondary'}>
                  {venue.availability}
                </Badge>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Type:</span>
                  <Badge variant="outline">{venue.spaceType}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Capacity:</span>
                  <span>{venue.capacity} people</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Base Price:</span>
                  <span>${venue.basePrice}</span>
                </div>
                {venue.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{venue.address}</span>
                  </div>
                )}
                {venue.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{venue.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No venues associated with this facility.</p>
        )}
      </CardContent>
    </Card>
  );
}