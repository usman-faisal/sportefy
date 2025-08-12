"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FacilityCreateForm } from "./facility-create-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function FacilityCreatePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Facilities
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Facility
          </h1>
          <p className="text-muted-foreground">
            Add a new facility to the system
          </p>
        </div>
      </div>

      <FacilityCreateForm />
    </div>
  );
} 