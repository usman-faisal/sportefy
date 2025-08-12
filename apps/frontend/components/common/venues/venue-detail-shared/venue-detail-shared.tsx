"use client";

import React from "react";
import { VenueDetails } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Edit, 
  Clock, 
  DollarSign,
  Building,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import BookingOverview from "@/components/common/bookings/booking-overview/booking-overview";

interface VenueDetailSharedProps {
  venue: VenueDetails;
  backHref: string;
  editHref: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  userType: 'admin' | 'staff';
}

export function VenueDetailShared({ 
  venue, 
  backHref, 
  editHref, 
  showDeleteButton = false,
  onDelete,
  userType 
}: VenueDetailSharedProps) {
  const bookings = venue.bookings || [];
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;
  const cancelledBookings = bookings.filter((b: any) => b.status === 'cancelled').length;
  const totalRevenue = bookings.reduce((acc: number, booking: any) => acc + (booking.totalCredits || 0), 0);
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <Link href={backHref}>
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
                    Venue Details and Management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={editHref}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Venue
                </Button>
              </Link>
              {showDeleteButton && onDelete && userType === 'admin' && (
                <Button variant="destructive" onClick={onDelete}>
                  Delete Venue
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                All time bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                Credits earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Confirmed Bookings
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
              <p className="text-xs text-muted-foreground">
                Active bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Bookings
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
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
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Base Price:</span>
                    <span className="font-medium">{venue.basePrice} credits</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Capacity:</span>
                    <span className="font-medium">{venue.capacity} players</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Space Type:</span>
                    <span className="font-medium capitalize">{venue.spaceType || "Not specified"}</span>
                  </div>

                  {venue.phoneNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span className="font-medium">{venue.phoneNumber}</span>
                    </div>
                  )}

                  {venue.address && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Address:</span>
                      <span className="font-medium text-right">{venue.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Facility Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Facility Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Facility:</span>
                    <span className="font-medium">{venue.facility?.name || "Unknown"}</span>
                  </div>
                  
                  {venue.facility?.phoneNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Facility Phone:</span>
                      <span className="font-medium">{venue.facility.phoneNumber}</span>
                    </div>
                  )}

                  {venue.facility?.address && (
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-muted-foreground">Facility Address:</span>
                      <span className="font-medium text-right">{venue.facility.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sports */}
              {venue.sports && venue.sports.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Available Sports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {venue.sports.map((sport: any) => (
                        <Badge key={sport.sport.name} variant="outline">
                          {sport.sport.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Operating Hours */}
              {venue.operatingHours && venue.operatingHours.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Operating Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {venue.operatingHours.map((hour: any) => (
                        <div key={hour.id} className="flex justify-between text-sm">
                          <span className="capitalize">{hour.dayOfWeek}</span>
                          <span>{hour.openTime} - {hour.closeTime}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <BookingOverview
              bookings={bookings}
              title="Venue Bookings"
              showStats={false}
              showActions={false}
            />
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Booking Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Booking Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confirmed</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{confirmedBookings}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${totalBookings > 0 ? (pendingBookings / totalBookings) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{pendingBookings}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cancelled</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{cancelledBookings}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{totalRevenue}</div>
                      <p className="text-sm text-muted-foreground">Total Credits Earned</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">{venue.basePrice}</div>
                        <p className="text-xs text-muted-foreground">Base Price</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0}</div>
                        <p className="text-xs text-muted-foreground">Avg per Booking</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardTitle>Venue Settings</CardTitle>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Manage venue settings and configuration options.
                </p>
                <div className="flex gap-2">
                  <Link href={editHref}>
                    <Button>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Venue
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
