"use client";

import { Profile } from "@sportefy/db-types";
import { PaginationData } from "@/lib/api/types";
import { UsersClient } from "./users-client";

interface UsersTableProps {
  initialUsers: Profile[];
  initialPagination: PaginationData;
  error?: string;
}

export default function UsersTable({
  initialUsers,
  initialPagination,
  error,
}: UsersTableProps) {
  return (
    <div className="p-6">
      <UsersClient
        initialUsers={initialUsers}
        initialPagination={initialPagination}
        error={error}
      />
    </div>
  );
}
