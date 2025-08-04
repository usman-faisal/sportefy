"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Profile } from "@sportefy/db-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/common/pagination"; 
import { Search, Users, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PaginationData } from "@/lib/api/types";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");



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

  return (
    <div className="space-y-6 p-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-6 text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8" />
              Users Management
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Manage and view all users in the system.
            </p>
          </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Users ({initialPagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.refresh()}>Try Again</Button>
            </div>
          )}

          {!error && initialUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
              {searchParams.get("search") && (
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search criteria.
                </p>
              )}
            </div>
          )}

          {!error && initialUsers.length > 0 && (
            <div className="space-y-4">
              {initialUsers.map((user: Profile) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`users/${user.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.fullName?.charAt(0)?.toUpperCase() ||
                        user.email?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.fullName || "No name provided"}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.userName && (
                        <p className="text-xs text-gray-400">
                          @{user.userName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                      {user.createdAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {formatDate(user.createdAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`users/${user.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" disabled className="opacity-50">
                        Block
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!error && initialPagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={initialPagination.page}
                totalPages={initialPagination.totalPages}
                onPageChange={handlePageChange}
              />
              <p className="text-center text-sm text-muted-foreground mt-4">
                Showing page {initialPagination.page} of{" "}
                {initialPagination.totalPages}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
