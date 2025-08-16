export const dynamic = "force-dynamic";

import { venueService, checkInService } from "@/lib/api/services";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Edit, 
  ArrowLeft,
  CheckCircle,
  Building,
  Wrench,
  Eye
} from "lucide-react";
import Link from "next/link";

interface GymDetailPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function GymDetailPage({
  params,
}: GymDetailPageProps) {
  const resolvedParams = await params;
  const venue = await venueService.getVenue(resolvedParams.venueId);
  const checkInCount = await checkInService.getCheckInCount(resolvedParams.venueId);

  if (!venue) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <Link href="/dashboard/staff/venues">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Venues
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {venue.name}
                    </h1>
                    <Badge 
                      variant={
                        venue.availability === 'active' ? "default" : 
                        venue.availability === 'maintenance' ? "destructive" : 
                        "secondary"
                      }
                      className={
                        venue.availability === 'active' ? "bg-green-600 hover:bg-green-700" :
                        venue.availability === 'maintenance' ? "bg-orange-600 hover:bg-orange-700" :
                        "bg-gray-600 hover:bg-gray-700"
                      }
                    >
                      {venue.availability === 'active' ? "Active" : 
                       venue.availability === 'maintenance' ? "Maintenance" : 
                       "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Gym Details and Management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/staff/venues/${venue.id}/check-ins`}>
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  View Check-ins
                </Button>
              </Link>
              <Link href={`/dashboard/staff/venues/${venue.id}/maintenance`}>
                <Button variant="outline">
                  <Wrench className="mr-2 h-4 w-4" />
                  Maintenance
                </Button>
              </Link>
              <Link href={`/dashboard/staff/venues/${venue.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Venue
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Currently Checked In Card */}
          <Card className="col-span-full lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Currently Checked In
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{checkInCount?.count || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active members in the gym
              </p>
            </CardContent>
          </Card>

          {/* Venue Information Card */}
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Facility</p>
                  <p className="text-sm">{venue.facility?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                  <p className="text-sm">{venue.capacity} people</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Base Price</p>
                  <p className="text-sm">₹{venue.basePrice}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Space Type</p>
                  <p className="text-sm capitalize">{venue.spaceType || 'N/A'}</p>
                </div>
              </div>
              {venue.address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-sm">{venue.address}</p>
                </div>
              )}
              {venue.phoneNumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{venue.phoneNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sports Card */}
          {venue.sports && venue.sports.length > 0 && (
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Sports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {venue.sports.map((sport: any) => (
                    <Badge key={sport.id} variant="secondary">
                      {sport.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operating Hours Card */}
          {venue.operatingHours && venue.operatingHours.length > 0 && (
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {venue.operatingHours.map((schedule: any) => (
                    <div key={schedule.id} className="flex justify-between">
                      <span className="text-sm font-medium capitalize">{schedule.dayOfWeek}</span>
                      <span className="text-sm text-muted-foreground">
                        {schedule.openTime} - {schedule.closeTime}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}