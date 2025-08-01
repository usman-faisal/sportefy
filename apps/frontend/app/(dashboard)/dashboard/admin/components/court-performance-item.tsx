"use client";

import React from "react";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookingOverview } from "@/lib/api/types";

interface CourtPerformanceItemProps {
  court: BookingOverview;
  index: number;
  page: number;
  limit: number;
}

export function CourtPerformanceItem({ 
  court, 
  index, 
  page, 
  limit 
}: CourtPerformanceItemProps) {
  return (
    <div className="border rounded-xl p-6 space-y-4 hover:shadow-md transition-shadow bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <span className="text-sm font-semibold text-primary">
              {index + 1 + (page - 1) * limit}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {court.courtName}
            </h3>
            <Badge
              variant={
                court.occupancyRate >= 80
                  ? "default"
                  : court.occupancyRate >= 50
                    ? "secondary"
                    : "outline"
              }
              className="mt-1"
            >
              {court.occupancyRate.toFixed(1)}% occupied
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            ${court.revenue.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Revenue</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Occupancy Rate</span>
          <span className="text-muted-foreground">
            {court.occupancyRate.toFixed(1)}%
          </span>
        </div>
        <Progress value={court.occupancyRate} className="h-3" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
        <div className="flex flex-col items-center md:flex-row gap-3 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-lg font-semibold text-green-700">
              {court.bookedSlots}
            </p>
            <p className="text-xs text-green-600">Booked</p>
          </div>
        </div>

        <div className="flex flex-col items-center md:flex-row gap-3 p-3 bg-blue-50 rounded-lg">
          <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-lg font-semibold text-blue-700">
              {court.availableSlots}
            </p>
            <p className="text-xs text-blue-600">Available</p>
          </div>
        </div>

        <div className="flex flex-col items-center md:flex-row gap-3 p-3 bg-red-50 rounded-lg">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-lg font-semibold text-red-700">
              {court.noShows}
            </p>
            <p className="text-xs text-red-600">No Shows</p>
          </div>
        </div>

        <div className="flex flex-col items-center md:flex-row gap-3 p-3 bg-emerald-50 rounded-lg">
          <DollarSign className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-lg font-semibold text-emerald-700">
              ${court.revenue.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600">Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
} 