"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookingWithRelations } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, CreditCard } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export type BookingColumn = {
  id: string;
  venueName: string;
  status: string;
  totalCredits: number;
  createdAt: string;
  matchType?: string;
  playerLimit?: number;
  original: BookingWithRelations;
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "confirmed":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "completed":
      return "outline";
    default:
      return "outline";
  }
};

export const columns: ColumnDef<BookingColumn>[] = [
  {
    accessorKey: "venueName",
    header: "Venue",
    cell: ({ row }) => {
      const booking = row.original.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {booking.venue?.name?.charAt(0)?.toUpperCase() || "V"}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {booking.venue?.name || "Unknown Venue"}
            </div>
            {booking.match && (
              <div className="text-xs text-gray-500">
                {booking.match.matchType} • {booking.match.paymentSplitType}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.getValue("status"))}>
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const booking = row.original.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {booking.createdAt ? formatDate(booking.createdAt) : "N/A"}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            {booking.createdAt ? formatTime(booking.createdAt) : "N/A"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "playerLimit",
    header: "Players",
    cell: ({ row }) => {
      const booking = row.original.original;
      if (!booking.match) return null;
      return (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3 w-3" />
          {booking.match.playerLimit} players
        </div>
      );
    },
  },
  {
    accessorKey: "totalCredits",
    header: "Credits",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <CreditCard className="h-3 w-3" />
        {row.getValue("totalCredits")} credits
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const booking = row.original.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
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
  },
];
