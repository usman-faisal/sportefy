"use client";

import { PaginatedResponse } from "@/lib/api/api";
import { BookingOverview } from "@/lib/api/types";
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pagination } from "../../../../../components/common/pagination";
import { DateSelector } from "./date-selector";

function AdminDashboardStats({
  bookingOverview,
}: {
  bookingOverview: PaginatedResponse<BookingOverview>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: courts = [], pagination } = bookingOverview;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const summary = {
    totalRevenue: courts.reduce((sum, court) => sum + court.revenue, 0),
    totalBookedSlots: courts.reduce((sum, court) => sum + court.bookedSlots, 0),
    totalAvailableSlots: courts.reduce(
      (sum, court) => sum + court.availableSlots,
      0
    ),
    totalNoShows: courts.reduce((sum, court) => sum + court.noShows, 0),
  };

  const totalSlots = summary.totalBookedSlots + summary.totalAvailableSlots;
  const overallOccupancyRate =
    totalSlots > 0 ? (summary.totalBookedSlots / totalSlots) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of booking performance and court utilization
          </p>
        </div>
        <div className="flex-shrink-0">
          <DateSelector />
        </div>
      </div>

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
              {overallOccupancyRate.toFixed(1)}% occupancy rate
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
              {courts.length}
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
              {summary.totalBookedSlots > 0
                ? (
                    (summary.totalNoShows / summary.totalBookedSlots) *
                    100
                  ).toFixed(1)
                : 0}
              % of bookings
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            Court Performance Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of each court's performance
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {courts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No court data available
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Check back later or adjust your date selection.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {courts.map((court, index) => (
                <div
                  key={court.courtId}
                  className="border rounded-xl p-6 space-y-4 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <span className="text-sm font-semibold text-primary">
                          {index + 1 + (pagination.page - 1) * pagination.limit}
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
              ))}
            </div>
          )}
        </CardContent>
        {pagination && pagination.totalPages > 1 && (
          <CardContent className="p-6 border-t">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default AdminDashboardStats;
