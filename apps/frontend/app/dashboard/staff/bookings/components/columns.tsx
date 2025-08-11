"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { StaffBookingCellAction } from "./staff-booking-cell-action";
import { Profile, Match, Slot } from "@sportefy/db-types";

export type BookingColumn = {
  id: string;
  venueName: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | null;
  totalCredits: number;
  bookedBy: Profile | null;
  createdAt: string;
  match: Match | null;
  slots: Slot[];
};

export const columns: ColumnDef<BookingColumn>[] = [
  {
    accessorKey: "id",
    header: "Booking ID",
    cell: ({ row }) => <div className="font-mono text-sm">{row.original.id.substring(0,8)}...</div>
  },
  {
    accessorKey: "venueName",
    header: "Venue",
  },
  {
    accessorKey: "bookedBy",
    header: "Booked By",
    cell: ({ row }) => <div>{row.original.bookedBy?.fullName || 'N/A'}</div>
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === 'completed' || status === 'confirmed' 
            ? 'default' 
            : status === 'cancelled' 
            ? 'destructive' 
            : 'secondary';
        return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
  {
    accessorKey: "totalCredits",
    header: "Price (Credits)",
  },
  {
    accessorKey: "createdAt",
    header: "Booking Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <StaffBookingCellAction data={row.original} />,
  },
];
