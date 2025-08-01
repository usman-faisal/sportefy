"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { CardContent } from "@/components/ui/card";

interface BookingEmptyStateProps {
  message?: string;
}

export function BookingEmptyState({ 
  message = "No bookings found" 
}: BookingEmptyStateProps) {
  return (
    <CardContent>
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </CardContent>
  );
} 