export const dynamic = "force-dynamic";

import { profileService, venueService, sportService, operatingHourService, facilityMediaService } from "@/lib/api/services";
import { PermissionChecker } from "@/lib/utils/permissions";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building, 
  MapPin, 
  Save, 
  ArrowLeft,
  Phone,
  Settings,
  Users,
  Clock,
  DollarSign,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { VenueEditForm } from "@/components/common/venues/venue-edit/venue-edit-form";
import { Scope } from "@/lib/types";

interface VenueEditPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function VenueEditPage({
  params,
}: VenueEditPageProps) {
  const { venueId } = await params;

  const profile = await profileService.getProfileWithScopes();
  if (!profile) {
    redirect("/auth/login");
  }

  const permissions = new PermissionChecker(profile);
  
  // Check if user can access this venue
  if (!permissions.canModerateVenue(venueId)) {
    redirect("/dashboard");
  }

  try {
    const [venue, sports, operatingHours, media] = await Promise.all([
      venueService.getVenue(venueId),
      sportService.getAllSports(),
      operatingHourService.getOperatingHours(venueId, Scope.VENUE),
      facilityMediaService.getMedia(venueId, Scope.VENUE),
    ]);

    if (!venue) {
      notFound();
    }

    const venueData = venue;

    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/staff/venues/${venueId}`}>
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

          {/* Quick Info Card */}
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
                  <p className="text-sm text-muted-foreground">{venueData.name || "Not set"}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Base Price</Label>
                  <p className="text-sm text-muted-foreground">{venueData.basePrice} credits</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Capacity</Label>
                  <p className="text-sm text-muted-foreground">{venueData.capacity} players</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground capitalize">{venueData.availability || "Not set"}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Space Type</Label>
                  <p className="text-sm text-muted-foreground capitalize">{venueData.spaceType || "Not set"}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sports</Label>
                  <p className="text-sm text-muted-foreground">
                    {venueData.sports?.length || 0} sports configured
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Edit Venue Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VenueEditForm
                venue={venueData}
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
  } catch (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-destructive">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">
                Error Loading Venue
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Failed to load venue data. Please try refreshing the page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
