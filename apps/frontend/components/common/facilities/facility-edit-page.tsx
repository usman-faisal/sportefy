"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FacilityDetails, UpdateFacilityDto } from "@/lib/api/types";
import { FacilityEditForm } from "./facility-edit/faciility-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { facilityService } from "@/lib/api/services";
import { toast } from "sonner";

interface FacilityEditPageProps {
  facility: FacilityDetails;
}

export function FacilityEditPage({ facility }: FacilityEditPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.push(`/dashboard/admin/  facilities/${facility.id}`);
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
        onCancel={handleBack}
      />
    </div>
  );
}