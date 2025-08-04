export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { userService } from "@/lib/api/services";
import UsersTable from "./components/users-table";

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

async function getUsersData(
  searchParams: Awaited<UsersPageProps["searchParams"]>
) {
  try {
    const page = searchParams.page ? parseInt(searchParams.page) : 1;
    const search = searchParams.search || "";

    const response = await userService.getAllUsers({
      page,
      limit: 10,
      search: search.trim() || undefined,
    });

    if (!response) {
      throw new Error("Failed to fetch users");
    }

    return {
      users: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      users: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedSearchParams = await searchParams;
  const { users, pagination, error } = await getUsersData(resolvedSearchParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersTable
        initialUsers={users}
        initialPagination={pagination}
        error={error}
      />
    </Suspense>
  );
}
