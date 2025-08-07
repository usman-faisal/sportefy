"use client";

import React from "react";
import { FacilityWithRelations, PaginationData } from "@/lib/api/types";
import { FacilitiesClient } from "./facilities-client";

interface FacilitiesTableProps {
  initialFacilities: FacilityWithRelations[];
  initialPagination: PaginationData;
  error?: string;
}

export default function FacilitiesTable({
  initialFacilities,
  initialPagination,
  error,
}: FacilitiesTableProps) {
  return (
    <div className="container mx-auto p-6">
      <FacilitiesClient
        initialFacilities={initialFacilities}
        initialPagination={initialPagination}
        error={error}
      />
    </div>
  );
}
