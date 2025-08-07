"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type VenueColumn = {
  id: string;
  name: string;
  facilityId: string;
  facilityName: string;
  address: string;
  createdAt: string;
};

export const columns: ColumnDef<VenueColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "facilityName",
    header: "Facility",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];