import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Users } from "lucide-react";

interface FacilitiesStatsProps {
  totalFacilities: number;
  activeVenues: number;
  totalSports: number;
}

export function FacilitiesStats({ 
  totalFacilities, 
  activeVenues, 
  totalSports 
}: FacilitiesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Facilities
              </p>
              <p className="text-2xl font-bold">{totalFacilities}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Venues
              </p>
              <p className="text-2xl font-bold">{activeVenues}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sports Available
              </p>
              <p className="text-2xl font-bold">{totalSports}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}