"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DateSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDate =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  const handleDateChange = (newDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const goToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    handleDateChange(today);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-gray-500" />
        <input
          type="date"
          value={currentDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {currentDate !== new Date().toISOString().split("T")[0] && (
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="text-sm"
        >
          Today
        </Button>
      )}
    </div>
  );
}
