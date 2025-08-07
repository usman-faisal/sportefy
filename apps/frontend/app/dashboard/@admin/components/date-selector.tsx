"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date();
  const todayString = format(today, "yyyy-MM-dd");

  const currentDateString = searchParams.get("date") || todayString;
  const currentDate = parseISO(currentDateString);

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(newDate, "yyyy-MM-dd"));
    params.delete("page"); 
    router.push(`?${params.toString()}`);
  };

  const goToToday = () => {
    handleDateChange(new Date());
  };

  const isToday = currentDateString === todayString;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !currentDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {currentDate ? format(currentDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {!isToday && (
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