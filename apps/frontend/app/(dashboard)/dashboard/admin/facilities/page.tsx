import { Suspense } from "react";
import { facilityService } from "@/lib/api/services";
import FacilitiesTable from "@/components/common/facilities/facilities-table/facilities-table";

interface FacilitiesPageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

async function getFacilitiesData(searchParams: FacilitiesPageProps["searchParams"]) {
  try {
    const page = searchParams.page ? parseInt(searchParams.page) : 1;
    const search = searchParams.search || "";
    
    const response = await facilityService.getAllFacilities({
      page,
      limit: 10,
      search: search.trim() || undefined,
    });

    if (!response) {
      throw new Error("Failed to fetch facilities");
    }

    return {
      facilities: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return {
      facilities: [],
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

export default async function FacilitiesPage({ searchParams }: FacilitiesPageProps) {
  searchParams = await searchParams;
  const { facilities, pagination, error } = await getFacilitiesData(searchParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacilitiesTable
        initialFacilities={facilities}
        initialPagination={pagination}
        error={error}
      />
    </Suspense>
  );
}
