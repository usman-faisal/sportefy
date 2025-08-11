"use client";

import React from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/common/pagination";
import { DataTable } from "@/components/ui/data-table";
import { BookingOverview } from "@/lib/api/types";
import { EmptyState } from "./empty-state";
import { CourtPerformanceColumn, columns } from "./court-performance-columns";

interface CourtPerformanceOverviewProps {
  courts: BookingOverview[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export function CourtPerformanceOverview({
  courts,
  pagination,
  onPageChange,
}: CourtPerformanceOverviewProps) {
  // Transform courts data to match the column structure
  const transformedData: CourtPerformanceColumn[] = courts.map((court, index) => ({
    courtId: court.courtId,
    courtName: court.courtName,
    bookedSlots: court.bookedSlots,
    availableSlots: court.availableSlots,
    occupancyRate: court.occupancyRate,
    revenue: court.revenue,
    noShows: court.noShows,
    index: index + 1 + (pagination.page - 1) * pagination.limit,
    original: court,
  }));

  return (
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
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <DataTable columns={columns} data={transformedData} />
        )}
      </CardContent>
      {pagination && pagination.totalPages > 1 && (
        <CardContent className="p-6 border-t">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </CardContent>
      )}
    </Card>
  );
}
