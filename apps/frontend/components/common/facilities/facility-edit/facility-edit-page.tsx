"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FacilityDetails } from "@/lib/api/types";
import { FacilityEditForm } from "./faciility-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FacilityEditPageProps {
  facility: FacilityDetails;
}

export function FacilityEditPage({ facility }: FacilityEditPageProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Facility
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit {facility.name}
          </h1>
          <p className="text-muted-foreground">
            Update facility information
          </p>
        </div>
      </div>

      <FacilityEditForm
        facility={facility}
        initialOperatingHours={facility.operatingHours}
        initialMedia={facility.media}
      />
    </div>
  );
}