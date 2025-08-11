export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, Users, MapPin, User, CreditCard, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { StaffBookingDetailClient } from "./components/staff-booking-detail-client";
import { profileService } from "@/lib/api/services";
import { getBookingDetails } from "@/lib/actions/booking-actions";

interface BookingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function checkStaffAccess(bookingId: string) {
  try {
    const profile = await profileService.getProfileWithScopes();
    if (!profile) {
      return false;
    }
    
    // Get the booking to check if staff has access to its venue/facility
    const bookingResult = await getBookingDetails(bookingId);
    if (!bookingResult.success || !bookingResult.data) {
      return false;
    }
    
    const booking = bookingResult.data;
    
    const userScopes = profile.userScopes || [];
    return userScopes.some(scope => {
      // Check if staff has access to the venue directly
      if (scope.venueId === booking.booking.venueId) {
        return true;
      }
      
      // Check if staff has access to the facility that owns the venue
      if (scope.venue && scope.venue.facilityId && scope.facilityId === scope.venue.facilityId) {
        return true;
      }
      
      return false;
    });
  } catch (error) {
    console.error("Error checking staff access:", error);
    return false;
  }
}

export default async function StaffBookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  
  // Check if staff has access to this booking
  const hasAccess = await checkStaffAccess(id);
  if (!hasAccess) {
    redirect("/dashboard/staff/bookings");
  }
  
  const bookingResult = await getBookingDetails(id);
  if (!bookingResult.success || !bookingResult.data) {
    notFound();
  }
  
  const booking = bookingResult.data;

  return (
    <Suspense fallback={<div>Loading booking details...</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/staff/bookings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Booking Details
              </h1>
              <p className="text-muted-foreground">
                Manage and view booking information
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Badge 
              variant={
                booking.booking.status === 'confirmed' ? 'default' :
                booking.booking.status === 'cancelled' ? 'destructive' :
                'secondary'
              }
              className="text-sm"
            >
              {booking.booking.status?.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Booking ID</h4>
                    <p className="text-lg font-mono">{booking.booking.id}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                    <Badge 
                      variant={
                        booking.booking.status === 'confirmed' ? 'default' :
                        booking.booking.status === 'cancelled' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {booking.booking.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Total Credits</h4>
                    <p className="text-lg font-medium">{booking.booking.totalCredits}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Created At</h4>
                    <p className="text-lg">
                      {new Date(booking.booking.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match Information */}
            {booking.match && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Match Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Title</h4>
                      <p className="text-lg">{booking.match.title || "Untitled Match"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Player Limit</h4>
                      <p className="text-lg">{booking.match.playerLimit}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Skill Level</h4>
                      <p className="text-lg">{booking.match.skillLevel || "Any"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Match Type</h4>
                      <p className="text-lg capitalize">{booking.match.matchType}</p>
                    </div>
                    {booking.match.minAge && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Age Range</h4>
                        <p className="text-lg">
                          {booking.match.minAge} - {booking.match.maxAge || "No limit"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Slot */}
            {booking.slot && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Slot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Start Time</h4>
                      <p className="text-lg">
                        {new Date(booking.slot.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">End Time</h4>
                      <p className="text-lg">
                        {new Date(booking.slot.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    disabled={booking.booking.status !== 'pending'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    disabled={!['pending', 'confirmed'].includes(booking.booking.status || '')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Name</h4>
                    <p className="text-lg">
                      {booking.booking.bookedByProfile?.fullName || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Email</h4>
                    <p className="text-lg">
                      {booking.booking.bookedByProfile?.email || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Information */}
            {booking.venue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Venue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Name</h4>
                      <p className="text-lg">{booking.venue.name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Capacity</h4>
                      <p className="text-lg">{booking.venue.capacity} people</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Base Price</h4>
                      <p className="text-lg">{booking.venue.basePrice} credits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Client Component for Interactive Features */}
        <StaffBookingDetailClient booking={booking} />
      </div>
    </Suspense>
  );
}
