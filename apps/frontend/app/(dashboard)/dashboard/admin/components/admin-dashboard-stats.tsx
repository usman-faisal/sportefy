"use client";

import { PaginatedResponse } from "@/lib/api/api";
import { BookingOverview } from "@/lib/api/types";
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { DashboardHeader } from "./dashboard-header";
import { DashboardSummaryCards } from "./dashboard-summary-cards";
import { CourtPerformanceOverview } from "./court-performance-overview";

interface AdminDashboardStatsProps {
  bookingOverview: PaginatedResponse<BookingOverview>;
}

function AdminDashboardStats({
  bookingOverview,
}: AdminDashboardStatsProps) {
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
    courtsCount: courts.length,
    overallOccupancyRate: (() => {
      const totalSlots = courts.reduce((sum, court) => sum + court.bookedSlots + court.availableSlots, 0);
      return totalSlots > 0 
        ? (courts.reduce((sum, court) => sum + court.bookedSlots, 0) / totalSlots) * 100 
        : 0;
    })(),
  };

  return (
    <div className="space-y-8">
      <DashboardHeader />
      <DashboardSummaryCards summary={summary} />
      <CourtPerformanceOverview
        courts={courts}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default AdminDashboardStats;
