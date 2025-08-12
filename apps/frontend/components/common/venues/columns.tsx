"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type VenueColumn = {
  id: string;
  name: string;
  facilityId: string;
  facilityName: string;
  address: string;
  availability: 'active' | 'inactive' | 'maintenance';
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
    accessorKey: "availability",
    header: "Status",
    cell: ({ row }) => {
      const availability = row.getValue("availability") as string;
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'active':
            return 'bg-green-100 text-green-800';
          case 'maintenance':
            return 'bg-orange-100 text-orange-800';
          case 'inactive':
            return 'bg-gray-100 text-gray-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }
      };
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(availability)}`}>
          {availability === 'active' ? 'Active' : 
           availability === 'maintenance' ? 'Maintenance' : 
           'Inactive'}
        </span>
      );
    },
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