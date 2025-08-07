"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slot } from "@sportefy/db-types";
import { format } from "date-fns";

interface SlotTimelineProps {
  slots: Slot[];
}

export const SlotTimeline: React.FC<SlotTimelineProps> = ({ slots }) => {
  if (!slots || slots.length === 0) {
    return <p className="text-muted-foreground">No slot information available.</p>;
  }

  const sortedSlots = [...slots].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const startTime = new Date(sortedSlots[0].startTime);
  const endTime = new Date(sortedSlots[sortedSlots.length - 1].endTime);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Slots</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
                <p>Date: <strong>{format(startTime, "MMMM do, yyyy")}</strong></p>
                <p>Duration: <strong>{format(startTime, "p")} - {format(endTime, "p")}</strong></p>
            </div>
            <div className="relative w-full bg-muted rounded-full h-8 overflow-hidden">
                {sortedSlots.map((slot, index) => (
                    <div key={slot.id} className="absolute h-full bg-primary flex items-center justify-center" style={{
                        left: `${(new Date(slot.startTime).getTime() - startTime.getTime()) / (endTime.getTime() - startTime.getTime()) * 100}%`,
                        width: `${(new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / (endTime.getTime() - startTime.getTime()) * 100}%`
                    }}>
                       <span className="text-xs font-medium text-primary-foreground px-2">
                           {format(new Date(slot.startTime), "p")}
                       </span>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};