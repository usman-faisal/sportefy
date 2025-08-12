
"use client";

import React from "react";
import { VenueDetails } from "@/lib/api/types";
import { VenueEditForm } from "../venue-edit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Building, 
  Settings,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface VenueEditSharedProps {
  venue: VenueDetails;
  sports: any[];
  operatingHours: any[];
  media: any[];
  backHref: string;
  userType: 'admin' | 'staff';
}

export function VenueEditShared({ 
  venue, 
  sports, 
  operatingHours, 
  media, 
  backHref, 
  userType 
}: VenueEditSharedProps) {
    console.log(sports)
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link href={backHref}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Venue
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Edit Venue
              </h1>
              <p className="text-muted-foreground mt-2">
                Update venue information and settings
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Current Venue Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Venue Name</Label>
                <p className="text-sm text-muted-foreground">{venue.name || "Not set"}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Base Price</Label>
                <p className="text-sm text-muted-foreground">{venue.basePrice} credits</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Capacity</Label>
                <p className="text-sm text-muted-foreground">{venue.capacity} players</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <p className="text-sm text-muted-foreground capitalize">{venue.availability || "Not set"}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Space Type</Label>
                <p className="text-sm text-muted-foreground capitalize">{venue.spaceType || "Not set"}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sports</Label>
                <p className="text-sm text-muted-foreground">
                  {venue.sports?.length || 0} sports configured
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Venue Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VenueEditForm
              venue={venue}
              sports={sports || []}
              initialOperatingHours={operatingHours || []}
              initialMedia={media || []}
            />
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Editing Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium">Basic Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Venue name should be descriptive and unique</li>
                  <li>• Base price determines the cost per booking</li>
                  <li>• Capacity should reflect the actual space available</li>
                  <li>• Status affects booking availability</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Sports & Hours</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Select sports that can be played in this venue</li>
                  <li>• Operating hours determine when bookings are allowed</li>
                  <li>• Media helps showcase the venue to users</li>
                  <li>• Changes take effect immediately</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
