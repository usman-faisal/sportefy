"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/common/pagination";
import { FacilityWithRelations } from "@/lib/api/types";
import { FacilitiesHeader } from "./faciilities-header";
import { FacilitiesSearchBar } from "./facilities-search-bar";
import { FacilitiesStats } from "./facilities-stats";
import { FacilitiesErrorState } from "./facilities-state-error";
import { FacilitiesEmptyState } from "./facilites-empty-state";
import { FacilitiesGrid } from "./facilities-grid";
import { LoadingState } from "@/components/ui/loading";

interface FacilitiesTableProps {
  initialFacilities: FacilityWithRelations[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

export default function FacilitiesTable({
  initialFacilities,
  initialPagination,
  error,
}: FacilitiesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [facilities, setFacilities] = useState(initialFacilities);
  const [pagination, setPagination] = useState(initialPagination);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
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
    router.push(`/dashboard/admin/facilities${newURL}`);
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
    router.push(`/dashboard/admin/facilities/${facilityId}`);
  };

  const handleAddFacility = () => {
    router.push("/dashboard/admin/facilities/create");
  };

  const handleEditFacility = (facilityId: string) => {
    console.log("Edit facility:", facilityId);
  };

  const totalFacilities = pagination.total;
  const activeVenues = facilities.reduce((acc, facility) => 
    acc + (facility.venue ? 1 : 0), 0
  );
  const totalSports = facilities.reduce((acc, facility) => 
    acc + (facility.venue?.sports?.length || 0), 0
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <FacilitiesHeader onAddFacility={handleAddFacility} />

      <div className="grid gap-6">
        <FacilitiesSearchBar 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        <FacilitiesStats
          totalFacilities={totalFacilities}
          activeVenues={activeVenues}
          totalSports={totalSports}
        />
      </div>

      {error && <FacilitiesErrorState error={error} />}

      {facilities.length === 0 && !isLoading ? (
        <FacilitiesEmptyState 
          searchQuery={searchQuery}
          onAddFacility={handleAddFacility}
        />
      ) : (
        <FacilitiesGrid
          facilities={facilities}
          onViewDetails={handleViewDetails}
          onEdit={handleEditFacility}
        />
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {isLoading && facilities.length > 0 && <LoadingState />}
    </div>
  );
}