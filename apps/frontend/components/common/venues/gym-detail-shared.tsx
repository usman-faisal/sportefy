"use client";

import React from "react";
import { VenueDetails } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Edit, 
  Clock, 
  Building,
  ArrowLeft,
  Wrench,
  UserCheck,
  List
} from "lucide-react";
import Link from "next/link";

interface GymDetailSharedProps {
  venue: VenueDetails;
  checkInCount: number;
  backHref: string;
  editHref: string;
  checkInsHref: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  userType: 'admin' | 'staff';
}

export function GymDetailShared({ 
  venue, 
  checkInCount,
  backHref, 
  editHref,
  checkInsHref,
  showDeleteButton = false,
  onDelete,
  userType 
}: GymDetailSharedProps) {
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
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                      Gym
                    </Badge>
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
                    Gym Details and Check-in Management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={checkInsHref}>
                <Button variant="outline">
                  <List className="mr-2 h-4 w-4" />
                  View Check-ins
                </Button>
              </Link>
              <Link href={`/dashboard/${userType}/venues/${venue.id}/maintenance`}>
                <Button variant="outline">
                  <Wrench className="mr-2 h-4 w-4" />
                  Maintenance
                </Button>
              </Link>
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

        {/* Current Check-ins Card */}
        <div className="mb-8">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <UserCheck className="h-6 w-6" />
                Current Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {checkInCount}
                  </div>
                  <p className="text-blue-700">
                    {checkInCount === 1 ? 'Person currently' : 'People currently'} checked in
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 mb-1">
                    Capacity: {venue.capacity}
                  </div>
                  <div className="w-32 bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((checkInCount / venue.capacity) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {Math.round((checkInCount / venue.capacity) * 100)}% occupied
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <span className="font-medium">{venue.capacity} people</span>
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
                      <Badge key={sport.name} variant="outline">
                        {sport.name}
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

          {/* Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Gym Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Manage gym settings, view check-ins, and configure maintenance schedules.
              </p>
              <div className="flex gap-2">
                <Link href={checkInsHref}>
                  <Button variant="outline">
                    <List className="mr-2 h-4 w-4" />
                    View All Check-ins
                  </Button>
                </Link>
                <Link href={`/dashboard/${userType}/venues/${venue.id}/maintenance`}>
                  <Button variant="outline">
                    <Wrench className="mr-2 h-4 w-4" />
                    Maintenance Schedules
                  </Button>
                </Link>
                <Link href={editHref}>
                  <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Gym
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}