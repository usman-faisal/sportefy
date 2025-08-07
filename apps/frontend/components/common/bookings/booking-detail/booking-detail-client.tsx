"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingWithRelations } from "@/lib/api/types";
import { BookingInfoCard } from "./booking-info-card";
import { Slot } from "@sportefy/db-types";
import { format } from "date-fns";

interface BookingDetailClientProps {
  booking: BookingWithRelations;
  slot: Slot;
}

export const BookingDetailClient: React.FC<BookingDetailClientProps> = ({ booking, slot }) => {
  return (
    <>
      <Heading
        title={`Booking #${booking.id?.substring(0, 8)}`}
        description={`Details for the booking at ${booking.venue?.name}`}
      />
      <Separator className="my-6" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Booking Slot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Date: <strong>{format(new Date(slot.startTime), "MMMM do, yyyy")}</strong></p>
                  <p>Time: <strong>{format(new Date(slot.startTime), "p")} - {format(new Date(slot.endTime), "p")}</strong></p>
                  <p>Event Type: <strong className="capitalize">{slot.eventType}</strong></p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Slot Duration</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / (1000 * 60))} minutes
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <BookingInfoCard booking={booking} />
        </div>
      </div>
    </>
  );
};