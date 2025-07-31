"use client";

import { Booking } from "@sportefy/db-types";
import { BookingWithRelations } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, CreditCard } from "lucide-react";

interface BookingListProps {
  bookings: BookingWithRelations[];
  title?: string;
  showVenue?: boolean;
  maxItems?: number;
  emptyMessage?: string;
}

export default function BookingList({
  bookings,
  title = "Booking History",
  showVenue = true,
  maxItems,
  emptyMessage = "No bookings found",
}: BookingListProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      case "completed":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const displayBookings = maxItems ? bookings.slice(0, maxItems) : bookings;

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title} ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {booking.venue?.name?.charAt(0)?.toUpperCase() || "V"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {booking.venue?.name || "Unknown Venue"}
                    </h3>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                                     <div className="flex items-center gap-4 text-sm text-gray-500">
                     <div className="flex items-center gap-1">
                       <Calendar className="h-3 w-3" />
                       {booking.createdAt ? formatDate(booking.createdAt) : "N/A"}
                     </div>
                     <div className="flex items-center gap-1">
                       <Clock className="h-3 w-3" />
                       {booking.createdAt ? formatTime(booking.createdAt) : "N/A"}
                     </div>
                    {booking.match && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {booking.match.playerLimit} players
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {booking.totalCredits} credits
                    </div>
                  </div>
                  {booking.match && (
                    <div className="mt-2 text-xs text-gray-400">
                      {booking.match.matchType} • {booking.match.paymentSplitType}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {booking.status === "pending" && (
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {maxItems && bookings.length > maxItems && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing {maxItems} of {bookings.length} bookings
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              View All Bookings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 