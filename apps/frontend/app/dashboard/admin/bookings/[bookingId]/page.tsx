export const dynamic = "force-dynamic";

import { BookingDetailClient } from "@/components/common/bookings/booking-detail/booking-detail-client";
import { bookingService } from "@/lib/api/services";
import { notFound } from "next/navigation";

interface BookingDetailPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const resolvedParams = await params;
  const result = await bookingService.getBookingDetails(
    resolvedParams.bookingId
  );
  if (!result) {
    notFound();
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BookingDetailClient
          booking={result.booking as any}
          slot={result.slot}
        />
      </div>
    </div>
  );
}
