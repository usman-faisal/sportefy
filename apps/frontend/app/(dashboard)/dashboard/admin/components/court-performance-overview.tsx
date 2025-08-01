"use client";

import React from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "../../../../../components/common/pagination";
import { BookingOverview } from "@/lib/api/types";
import { CourtPerformanceItem } from "./court-performance-item";
import { EmptyState } from "./empty-state";

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
  onPageChange 
}: CourtPerformanceOverviewProps) {
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
          <div className="space-y-6">
            {courts.map((court, index) => (
              <CourtPerformanceItem
                key={court.courtId}
                court={court}
                index={index}
                page={pagination.page}
                limit={pagination.limit}
              />
            ))}
          </div>
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