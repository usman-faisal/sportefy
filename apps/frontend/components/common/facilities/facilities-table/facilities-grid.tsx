import React from "react";
import { FacilityWithRelations } from "@/lib/api/types";
import { FacilityCard } from "./facility-card";

interface FacilitiesGridProps {
  facilities: FacilityWithRelations[];
  onViewDetails: (facilityId: string) => void;
  onEdit?: (facilityId: string) => void;
}

export function FacilitiesGrid({ facilities, onViewDetails, onEdit }: FacilitiesGridProps) {
  return (
    <div className="grid gap-4">
      {facilities.map((facility) => (
        <FacilityCard
          key={facility.id}
          facility={facility}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}