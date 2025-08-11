"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@sportefy/db-types";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
        const type = row.original.type;
        const isDebit = row.original.amount < 0;
        return (
            <div className="flex items-center capitalize">
                {isDebit ? <ArrowUpRight className="mr-2 h-4 w-4 text-red-500"/> : <ArrowDownLeft className="mr-2 h-4 w-4 text-green-500"/>}
                {type?.replace('_', ' ')}
            </div>
        )
    }
  },
  {
    accessorKey: "amount",
    header: "Amount (Credits)",
    cell: ({ row }) => {
        const amount = row.original.amount;
        const isDebit = amount < 0;
        return <span className={isDebit ? 'text-red-500' : 'text-green-500'}>{amount}</span>
    }
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <div>{format(new Date(row.original.createdAt!), "PPpp")}</div>,
  },
];