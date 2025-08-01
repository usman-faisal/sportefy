"use client";

import { BookingWithRelations } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

import { BookingListHeader } from "./booking-list-header";
import { BookingItem } from "./booking-item";
import { BookingEmptyState } from "./booking-empty-state";
import { BookingListFooter } from "./booking-list-footer";

interface BookingListProps {
  bookings: BookingWithRelations[];
  title?: string;
  maxItems?: number;
  emptyMessage?: string;
  onViewDetails?: (booking: BookingWithRelations) => void;
  onCancel?: (booking: BookingWithRelations) => void;
  onViewAll?: () => void;
}

export default function BookingList({
  bookings,
  title = "Booking History",
  maxItems,
  emptyMessage = "No bookings found",
  onViewDetails,
  onCancel,
  onViewAll,
}: BookingListProps) {
  const displayBookings = maxItems ? bookings.slice(0, maxItems) : bookings;

  return (
    <Card>
      <BookingListHeader title={title} count={bookings.length} />
      
      {bookings.length === 0 ? (
        <BookingEmptyState message={emptyMessage} />
      ) : (
        <>
          <CardContent>
            <div className="space-y-4">
              {displayBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={booking}
                  onViewDetails={onViewDetails}
                  onCancel={onCancel}
                />
              ))}
            </div>
          </CardContent>

          {maxItems && (
            <BookingListFooter
              maxItems={maxItems}
              totalCount={bookings.length}
              onViewAll={onViewAll}
            />
          )}
        </>
      )}
    </Card>
  );
} 