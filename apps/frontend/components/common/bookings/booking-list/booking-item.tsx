"use client";

import React from "react";
import { BookingWithRelations } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, CreditCard } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { BookingStatusBadge } from "./booking-status-badge";

interface BookingItemProps {
  booking: BookingWithRelations;
  onViewDetails?: (booking: BookingWithRelations) => void;
}

export function BookingItem({ booking, onViewDetails }: BookingItemProps) {
  const handleViewDetails = () => {
    onViewDetails?.(booking);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {booking.venue?.name?.charAt(0)?.toUpperCase() || "V"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900">
              {booking.venue?.name || "Unknown Venue"}
            </h3>
            <BookingStatusBadge status={booking.status} />
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
        <Button variant="outline" size="sm" onClick={handleViewDetails}>
          View Details
        </Button>
        {booking.status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
