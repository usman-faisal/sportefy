import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FacilityDetails } from "@/lib/api/types";

interface FacilityQuickStatsProps {
  venue: FacilityDetails['venue'];
  operatingHours: FacilityDetails['operatingHours'];
  media: FacilityDetails['media'];
}

export function FacilityQuickStats({ venue, operatingHours, media }: FacilityQuickStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Venues</span>
          <Badge variant="outline">{venue ? 1 : 0}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Operating Hours</span>
          <Badge variant="outline">{operatingHours?.length || 0}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Media Files</span>
          <Badge variant="outline">{media?.length || 0}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}