"use client";

import { BookingWithRelations } from "@/lib/api/types";
import React from "react";
import { BookingClient } from "./booking-client";

interface BookingListProps {
  bookings: BookingWithRelations[];
  title?: string;
  maxItems?: number;
  emptyMessage?: string;
  onViewDetails?: (booking: BookingWithRelations) => void;
  onViewAll?: () => void;
}

export default function BookingList({
  bookings,
  title = "Booking History",
  maxItems,
  emptyMessage = "No bookings found",
  onViewDetails,
  onViewAll,
}: BookingListProps) {
  const displayBookings = maxItems ? bookings.slice(0, maxItems) : bookings;

  return (
    <BookingClient
      bookings={displayBookings}
      title={title}
      onViewDetails={onViewDetails}
      onViewAll={onViewAll}
      showViewAllButton={!!maxItems && bookings.length > maxItems}
    />
  );
}
