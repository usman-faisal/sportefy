import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { FacilityDetails } from "@/lib/api/types";

interface FacilityOwnerProps {
  owner: FacilityDetails['owner'];
}

export function FacilityOwner({ owner }: FacilityOwnerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Owner
        </CardTitle>
      </CardHeader>
      <CardContent>
        {owner ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{owner.profile.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{owner.profile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone No</label>
              <Badge variant="secondary">{owner.profile.phoneNumber}</Badge>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No owner information available.</p>
        )}
      </CardContent>
    </Card>
  );
}