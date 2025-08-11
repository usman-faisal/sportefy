"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { PaymentWithUser } from "@/lib/api/types";
import { format } from "date-fns";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const columns: ColumnDef<PaymentWithUser>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => <div>{row.original.user?.fullName || "N/A"}</div>,
  },
  {
    accessorKey: "amountCredits",
    header: "Amount (Credits)",
  },
  {
    accessorKey: "screenshotUrl",
    header: "Proof",
    cell: ({ row }) => (
      <Link href={row.original.screenshotUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
        View Proof <ExternalLink className="ml-2 h-4 w-4" />
      </Link>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Request Date",
    cell: ({ row }) => <div>{format(new Date(row.original.createdAt!), "MMMM do, yyyy")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];