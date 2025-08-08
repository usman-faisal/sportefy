export const dynamic = "force-dynamic";

import { bookingService } from "@/lib/api/services";
import { AllBookingsClient } from "./components/client";

export default async function AllBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: number;
    limit?: number;
    venueId?: string;
    status?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [bookingsData, statsData] = await Promise.all([
    bookingService.getAllBookings(resolvedSearchParams),
    bookingService.getBookingStats(),
  ]);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AllBookingsClient bookingsData={bookingsData} statsData={statsData} />
      </div>
    </div>
  );
}
