"use client";

import { BookingWithRelations } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { BookingColumn, columns } from "./columns";
import { formatDate, formatTime } from "@/lib/utils";

interface BookingClientProps {
  bookings: BookingWithRelations[];
  title?: string;
  onViewDetails?: (booking: BookingWithRelations) => void;
  onViewAll?: () => void;
  showViewAllButton?: boolean;
}

export const BookingClient: React.FC<BookingClientProps> = ({ 
  bookings, 
  title = "Booking History",
  onViewDetails,
  onViewAll,
  showViewAllButton = false,
}) => {
  const transformedData: BookingColumn[] = bookings.map((booking) => ({
    id: booking.id,
    venueName: booking.venue?.name || "Unknown Venue",
    status: booking.status,
    totalCredits: booking.totalCredits,
    createdAt: booking.createdAt ? formatDate(booking.createdAt) : "N/A",
    matchType: booking.match?.matchType,
    playerLimit: booking.match?.playerLimit,
    original: booking,
  }));

  const columnsWithCallbacks = columns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: { row: { original: BookingColumn } }) => {
          const booking = row.original.original;
          return (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails?.(booking)}
              >
                View Details
              </Button>
              {booking.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel
                </Button>
              )}
            </div>
          );
        },
      };
    }
    return column;
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`${title} (${bookings.length})`}
          description="Manage and view booking details"
        />
        {showViewAllButton && onViewAll && (
          <Button onClick={onViewAll} variant="outline">
            View All
          </Button>
        )}
      </div>
      <Separator />
      <DataTable columns={columnsWithCallbacks} data={transformedData} />
    </>
  );
};
