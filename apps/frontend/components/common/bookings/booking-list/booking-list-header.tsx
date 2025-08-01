"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface BookingListHeaderProps {
  title: string;
  count?: number;
}

export function BookingListHeader({ title, count }: BookingListHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        {count !== undefined ? `${title} (${count})` : title}
      </CardTitle>
    </CardHeader>
  );
} 