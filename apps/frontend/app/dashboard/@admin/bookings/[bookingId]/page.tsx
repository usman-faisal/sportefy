import { BookingDetailClient } from "@/components/common/bookings/booking-detail/booking-detail-client";
import { bookingService } from "@/lib/api/services";
import { notFound } from "next/navigation";

interface BookingDetailPageProps {
  params: { bookingId: string };
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const booking = await bookingService.getBookingDetails(params.bookingId);

  if (!booking) {
    notFound();
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BookingDetailClient booking={booking} />
      </div>
    </div>
  );
}