"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BookingWithRelations } from "@/lib/api/types";
import { SlotTimeline } from "../../slots/slot-timeline";
import { BookingInfoCard } from "./booking-info-card";

interface BookingDetailClientProps {
  booking: BookingWithRelations;
}

export const BookingDetailClient: React.FC<BookingDetailClientProps> = ({ booking }) => {
  return (
    <>
      <Heading
        title={`Booking #${booking.id?.substring(0, 8)}`}
        description={`Details for the booking at ${booking.venue?.name}`}
      />
      <Separator className="my-6" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <SlotTimeline slots={booking.slots || []} />
        </div>
        <div className="lg:col-span-1">
            <BookingInfoCard booking={booking} />
        </div>
      </div>
    </>
  );
};