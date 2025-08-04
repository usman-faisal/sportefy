"use client";

import React from "react";
import {
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardSummary {
  totalRevenue: number;
  totalBookedSlots: number;
  totalAvailableSlots: number;
  totalNoShows: number;
  courtsCount: number;
  overallOccupancyRate: number;
}

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  const noShowPercentage = summary.totalBookedSlots > 0
    ? (summary.totalNoShows / summary.totalBookedSlots) * 100
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${summary.totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            For selected period
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Booked Slots</CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {summary.totalBookedSlots}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.overallOccupancyRate.toFixed(1)}% occupancy rate
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {summary.courtsCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.totalAvailableSlots} available slots
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">No Shows</CardTitle>
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {summary.totalNoShows}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {noShowPercentage.toFixed(1)}% of bookings
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 