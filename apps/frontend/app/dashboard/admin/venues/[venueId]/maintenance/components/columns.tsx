"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MaintenanceScheduleWithRelations } from "@/lib/api/types";
import { MaintenanceScheduleCellAction } from "./maintenance-schedule-cell-action";
import { format } from "date-fns";

export type MaintenanceScheduleColumn = {
  id: string;
  reason: string;
  startTime: string;
  endTime: string;
  duration: string;
  scheduledBy: string;
  createdAt: string;
};

export const columns: ColumnDef<MaintenanceScheduleColumn>[] = [
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("reason")}>
        {row.getValue("reason") || "No reason provided"}
      </div>
    ),
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("startTime")}
      </div>
    ),
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("endTime")}
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue("duration")}
      </Badge>
    ),
  },
  {
    accessorKey: "scheduledBy",
    header: "Scheduled By",
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">
        {row.getValue("scheduledBy") || "Unknown"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue("createdAt")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <MaintenanceScheduleCellAction data={row.original} />
    ),
  },
];
