"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FacilityWithRelations } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

export type FacilityColumn = {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  venueName?: string | null;
  sportsCount: number;
  createdAt: string;
  phoneNumber?: string | null;
  original: FacilityWithRelations;
};

export const columns: ColumnDef<FacilityColumn>[] = [
  {
    accessorKey: "name",
    header: "Facility",
    cell: ({ row }) => {
      const facility = row.original.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{facility.name}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            {facility.description || "No description available"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "venueName",
    header: "Venue",
    cell: ({ row }) => {
      const facility = row.original.original;
      return (
        <div className="space-y-1">
          {facility.venue ? (
            <div className="text-sm">
              <div className="font-medium">{facility.venue.name}</div>
              {facility.venue.sports && facility.venue.sports.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {facility.venue.sports.slice(0, 2).map((sport, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs"
                    >
                      {sport.name}
                    </Badge>
                  ))}
                  {facility.venue.sports.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{facility.venue.sports.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No venue</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Location",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return address ? (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[200px]">{address}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">No address</span>
      );
    },
  },
  {
    accessorKey: "sportsCount",
    header: "Sports",
    cell: ({ row }) => {
      const count = row.getValue("sportsCount") as number;
      return (
        <div className="text-sm">
          {count > 0 ? `${count} sport${count !== 1 ? 's' : ''}` : "No sports"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {row.getValue("createdAt")}
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: () => <Badge variant="default">Active</Badge>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const facility = row.original.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      );
    },
  },
];
