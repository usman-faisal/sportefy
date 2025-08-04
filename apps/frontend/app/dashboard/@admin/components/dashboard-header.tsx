"use client";

import React from "react";
import { DateSelector } from "./date-selector";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
}

export function DashboardHeader({ 
  title = "Admin Dashboard",
  description = "Overview of booking performance and court utilization"
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <DateSelector />
      </div>
    </div>
  );
} 