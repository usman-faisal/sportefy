"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Profile } from "@sportefy/db-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

export type UserColumn = {
  id: string;
  fullName: string;
  email: string;
  userName?: string;
  role: string;
  credits: number;
  checkIns: number;
  createdAt: string;
  original: Profile;
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "default";
    case "user":
      return "secondary";
    default:
      return "outline";
  }
};

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "fullName",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {user.fullName?.charAt(0)?.toUpperCase() ||
              user.email?.charAt(0)?.toUpperCase() ||
              "?"}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.fullName || "No name provided"}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
            {user.userName && (
              <div className="text-xs text-gray-400">@{user.userName}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={getRoleBadgeVariant(row.getValue("role"))}>
        {row.getValue("role")}
      </Badge>
    ),
  },
  {
    accessorKey: "credits",
    header: "Credits",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("credits")} credits
      </div>
    ),
  },
  {
    accessorKey: "checkIns",
    header: "Check-ins",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("checkIns")} check-ins
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <div className="text-sm text-gray-500">
        {row.getValue("createdAt")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" disabled className="opacity-50">
            Block
          </Button>
        </div>
      );
    },
  },
];
