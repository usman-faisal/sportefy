"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { BookingStats, BookingWithRelations } from "@/lib/api/types";
import { columns, BookingColumn } from "./columns";
import { BookingStatsGrid } from "./booking-stats-grid";
import { BookingFilters } from "./booking-filters";
import { PaginatedResponse } from "@/lib/api/api";

interface AllBookingsClientProps {
  bookingsData: PaginatedResponse<BookingWithRelations> | null;
  statsData: BookingStats | null;
}

export const AllBookingsClient: React.FC<AllBookingsClientProps> = ({
  bookingsData,
  statsData,
}) => {
  const formattedBookings: BookingColumn[] = bookingsData?.data.map((item) => ({
    id: item.id,
    venueName: item.venue?.name ?? "N/A",
    status: item.status ?? "pending",
    totalCredits: item.totalCredits || 0,
    bookedBy: item.bookedByProfile || null,
    createdAt: new Date(item.createdAt!).toLocaleDateString(),
  })) || [];

  return (
    <>
      <Heading
        title={`All Bookings (${bookingsData?.pagination.total || 0})`}
        description="View and manage all bookings across all venues"
      />
      <Separator className="my-4" />
      <BookingStatsGrid stats={statsData} />
      <Separator className="my-4" />
      <BookingFilters />
      <DataTable
        searchKey="status"
        columns={columns}
        data={formattedBookings}
        pagination={bookingsData?.pagination}
      />
    </>
  );
};