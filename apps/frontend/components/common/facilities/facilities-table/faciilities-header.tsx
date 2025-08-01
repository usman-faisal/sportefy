import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FacilitiesHeaderProps {
  onAddFacility?: () => void;
}

export function FacilitiesHeader({ onAddFacility }: FacilitiesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
        <p className="text-muted-foreground">
          Manage all facilities in your system
        </p>
      </div>
      <Button className="w-full sm:w-auto" onClick={onAddFacility}>
        <Plus className="h-4 w-4 mr-2" />
        Add Facility
      </Button>
    </div>
  );
}