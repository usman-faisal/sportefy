import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Phone, MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { FacilityDetails } from "@/lib/api/types";

interface FacilityBasicInfoProps {
  facility: Pick<FacilityDetails, 'name' | 'phoneNumber' | 'description' | 'address' | 'createdAt' | 'updatedAt'>;
}

export function FacilityBasicInfo({ facility }: FacilityBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-sm">{facility.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Phone</label>
            <p className="text-sm flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {facility.phoneNumber || "Not provided"}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-sm">{facility.description || "No description available"}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <p className="text-sm flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {facility.address || "No address provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created</label>
            <p className="text-sm flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(facility.createdAt || new Date())}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
            <p className="text-sm flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(facility.updatedAt || new Date())}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}