"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Profile } from "@sportefy/db-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Search, Users, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PaginationData } from "@/lib/api/types";
import { UserColumn, columns } from "./columns";

interface UsersClientProps {
  initialUsers: Profile[];
  initialPagination: PaginationData;
  error?: string;
}

export const UsersClient: React.FC<UsersClientProps> = ({
  initialUsers,
  initialPagination,
  error,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const transformedData: UserColumn[] = initialUsers.map((user) => ({
    id: user.id,
    fullName: user.fullName || "No name provided",
    email: user.email,
    userName: user.userName || undefined,
    role: user.role,
    credits: user.credits || 0,
    checkIns: user.checkIns || 0,
    createdAt: user.createdAt ? formatDate(user.createdAt) : "N/A",
    original: user,
  }));

  const columnsWithCallbacks = columns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: { row: { original: UserColumn } }) => {
          const user = row.original.original;
          return (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`users/${user.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" disabled className="opacity-50">
                Block
              </Button>
            </div>
          );
        },
      };
    }
    return column;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8" />
          <Heading
            title="Users Management"
            description="Manage and view all users in the system."
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.refresh()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      ) : initialUsers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
              {searchParams.get("search") && (
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search criteria.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Heading
              title={`Users (${initialPagination.total})`}
              description="All registered users in the system"
            />
          </div>
          <Separator />
          <DataTable columns={columnsWithCallbacks} data={transformedData} pagination={initialPagination}/>
        </>
      )}
    </div>
  );
};
