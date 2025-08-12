"use client";

import React from "react";
import { FacilityDetails } from "@/lib/api/types";
import { FacilityEditForm } from "../facility-edit";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FacilityEditSharedProps {
  facility: FacilityDetails;
  backHref: string;
  userType: 'admin' | 'staff';
}

export function FacilityEditShared({ 
  facility, 
  backHref, 
  userType 
}: FacilityEditSharedProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Facility
          </Link>
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
