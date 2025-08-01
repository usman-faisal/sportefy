"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

interface FacilityHeaderProps {
  facilityName: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function FacilityHeader({ 
  facilityName, 
  onBack, 
  onEdit, 
  onDelete 
}: FacilityHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Facilities
      </Button>
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight">{facilityName}</h1>
        <p className="text-muted-foreground">Facility Details</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}