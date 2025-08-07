"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookingOverview } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp 
} from "lucide-react";

export type CourtPerformanceColumn = {
  courtId: string;
  courtName: string;
  bookedSlots: number;
  availableSlots: number;
  occupancyRate: number;
  revenue: number;
  noShows: number;
  index: number;
  original: BookingOverview;
};

export const columns: ColumnDef<CourtPerformanceColumn>[] = [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row }) => (
      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
        <span className="text-sm font-semibold text-primary">
          {row.getValue("index")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "courtName",
    header: "Court Name",
    cell: ({ row }) => {
      const occupancyRate = row.getValue("occupancyRate") as number;
      return (
        <div className="space-y-1">
          <div className="font-semibold">{row.getValue("courtName")}</div>
          <Badge
            variant={
              occupancyRate >= 80
                ? "default"
                : occupancyRate >= 50
                  ? "secondary"
                  : "outline"
            }
          >
            {occupancyRate.toFixed(1)}% occupied
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "occupancyRate",
    header: "Occupancy",
    cell: ({ row }) => {
      const rate = row.getValue("occupancyRate") as number;
      return (
        <div className="space-y-2 min-w-[120px]">
          <div className="flex justify-between text-sm">
            <span>{rate.toFixed(1)}%</span>
          </div>
          <Progress value={rate} className="h-2" />
        </div>
      );
    },
  },
  {
    accessorKey: "bookedSlots",
    header: "Booked",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="font-semibold">{row.getValue("bookedSlots")}</span>
      </div>
    ),
  },
  {
    accessorKey: "availableSlots",
    header: "Available",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-blue-600">
        <Clock className="h-4 w-4" />
        <span className="font-semibold">{row.getValue("availableSlots")}</span>
      </div>
    ),
  },
  {
    accessorKey: "noShows",
    header: "No Shows",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle className="h-4 w-4" />
        <span className="font-semibold">{row.getValue("noShows")}</span>
      </div>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      const revenue = row.getValue("revenue") as number;
      return (
        <div className="flex items-center gap-2 text-green-600">
          <DollarSign className="h-4 w-4" />
          <span className="font-bold text-lg">
            ${revenue.toLocaleString()}
          </span>
        </div>
      );
    },
  },
];
