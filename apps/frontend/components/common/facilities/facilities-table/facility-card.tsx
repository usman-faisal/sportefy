import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Eye } from "lucide-react";
import { FacilityWithRelations } from "@/lib/api/types";

interface FacilityCardProps {
  facility: FacilityWithRelations;
  onViewDetails: (facilityId: string) => void;
  onEdit?: (facilityId: string) => void;
}

export function FacilityCard({ facility, onViewDetails }: FacilityCardProps) {
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = () => {
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{facility.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {facility.description || "No description available"}
                </p>
              </div>
              {getStatusBadge()}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{facility.address || "No address"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(facility.createdAt)}</span>
              </div>
            </div>

            {facility.venue && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Venue:</span>
                  <span className="text-sm">{facility.venue.name}</span>
                </div>
                {facility.venue.sports && facility.venue.sports.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sports:</span>
                    <div className="flex gap-1">
                      {facility.venue.sports.slice(0, 3).map((sport, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {sport.name}
                        </Badge>
                      ))}
                      {facility.venue.sports.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{facility.venue.sports.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(facility.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
