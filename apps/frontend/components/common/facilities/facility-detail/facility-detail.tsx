// components/facility/FacilityDetail.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FacilityDetails } from "@/lib/api/types";

import { OperatingHours } from "@/components/common/operating-hours/operating-hours";
import { Media } from "@/components/common/media/media";
import { FacilityHeader } from "./facility-header";
import { FacilityBasicInfo } from "./facility-basic-info";
import { FacilityVenues } from "./facility-venues";
import { FacilityOwner } from "./facility-owner";
import { FacilityQuickStats } from "./facility-quick-stats";
import { FacilityDeleteDialog } from "./facility-delete-dialog";

interface FacilityDetailProps {
  facility: FacilityDetails;
}

export default function FacilityDetail({ facility }: FacilityDetailProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleBack = () => {
    router.push("/dashboard/facilities");
  };

  const handleEdit = () => {
    router.push(`/dashboard/facilities/${facility.id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <FacilityHeader
        facilityName={facility.name ?? "Facility Name"}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <FacilityBasicInfo facility={facility} />
          <FacilityVenues venue={facility.venue} />
          <OperatingHours operatingHours={facility.operatingHours} />
          <Media media={facility.media} />
        </div>

        <div className="space-y-6">
          <FacilityOwner owner={facility.owner} />
          <FacilityQuickStats
            venue={facility.venue}
            operatingHours={facility.operatingHours}
            media={facility.media}
          />
        </div>
      </div>

      <FacilityDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        facilityId={facility.id}
        facilityName={facility.name || "Unknown Facility"}
      />
    </div>
  );
}