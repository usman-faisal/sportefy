"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/common/pagination";
import { FacilityWithRelations, PaginationData } from "@/lib/api/types";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FacilitiesStats } from "./facilities-stats";
import { FacilitiesErrorState } from "./facilities-state-error";
import { FacilitiesEmptyState } from "./facilites-empty-state";
import { LoadingState } from "@/components/ui/loading";
import { FacilityColumn, columns } from "./columns";
import { formatDate } from "@/lib/utils";
import { Search, Plus, Building2, Eye } from "lucide-react";

interface FacilitiesClientProps {
  initialFacilities: FacilityWithRelations[];
  initialPagination: PaginationData;
  error?: string;
}

export const FacilitiesClient: React.FC<FacilitiesClientProps> = ({
  initialFacilities,
  initialPagination,
  error,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [facilities, setFacilities] = useState(initialFacilities);
  const [pagination, setPagination] = useState(initialPagination);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFacilities(initialFacilities);
    setPagination(initialPagination);
  }, [initialFacilities, initialPagination]);

  const updateURL = (page: number, search: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);

    const newURL = params.toString() ? `?${params.toString()}` : "";
    router.push(`/dashboard/facilities${newURL}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateURL(1, value);
  };

  const handlePageChange = (page: number) => {
    updateURL(page, searchQuery);
  };

  const handleViewDetails = (facilityId: string) => {
    router.push(`/dashboard/facilities/${facilityId}`);
  };

  const handleAddFacility = () => {
    router.push("/dashboard/facilities/create");
  };

  // Transform facilities data to match the column structure
  const transformedData: FacilityColumn[] = facilities.map((facility) => ({
    id: facility.id,
    name: facility.name || "Unnamed Facility",
    description: facility.description,
    address: facility.address,
    venueName: facility.venue?.name,
    sportsCount: facility.venue?.sports?.length || 0,
    createdAt: facility.createdAt ? formatDate(facility.createdAt) : "N/A",
    phoneNumber: facility.phoneNumber,
    original: facility,
  }));

  // Create columns with callbacks
  const columnsWithCallbacks = columns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: { row: { original: FacilityColumn } }) => {
          const facility = row.original.original;
          return (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDetails(facility.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </div>
          );
        },
      };
    }
    return column;
  });

  const totalFacilities = pagination.total;
  const activeVenues = facilities.reduce(
    (acc, facility) => acc + (facility.venue ? 1 : 0),
    0
  );
  const totalSports = facilities.reduce(
    (acc, facility) => acc + (facility.venue?.sports?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          <Heading
            title="Facilities Management"
            description="Manage and view all facilities in the system."
          />
        </div>
        <Button onClick={handleAddFacility}>
          <Plus className="mr-2 h-4 w-4" />
          Add Facility
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search facilities by name, description, or address..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <FacilitiesStats
        totalFacilities={totalFacilities}
        activeVenues={activeVenues}
        totalSports={totalSports}
      />

      {/* Error State */}
      {error && <FacilitiesErrorState error={error} />}

      {/* Empty State */}
      {facilities.length === 0 && !isLoading && !error ? (
        <FacilitiesEmptyState
          searchQuery={searchQuery}
          onAddFacility={handleAddFacility}
        />
      ) : !error ? (
        <>
          <div className="flex items-center justify-between">
            <Heading
              title={`Facilities (${totalFacilities})`}
              description="All facilities in the system"
            />
          </div>
          <Separator />
          <DataTable columns={columnsWithCallbacks} data={transformedData} pagination={initialPagination} />
          
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : null}

      {/* Loading State */}
      {isLoading && facilities.length > 0 && <LoadingState />}
    </div>
  );
};
