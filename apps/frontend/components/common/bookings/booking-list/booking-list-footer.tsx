"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

interface BookingListFooterProps {
  maxItems: number;
  totalCount: number;
  onViewAll?: () => void;
}

export function BookingListFooter({ 
  maxItems, 
  totalCount, 
  onViewAll 
}: BookingListFooterProps) {
  if (totalCount <= maxItems) {
    return null;
  }

  return (
    <CardContent>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Showing {maxItems} of {totalCount} bookings
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onViewAll}>
          View All Bookings
        </Button>
      </div>
    </CardContent>
  );
} 