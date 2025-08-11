"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DashboardReport } from "@/lib/api/types";
import { BookingTrendsChart } from "./booking-trends-chart";
import { PopularTimeSlots } from "./popular-time-slots";
import { ReportSummary } from "./report-summary";

interface ReportsClientProps {
  data: DashboardReport;
}

export const ReportsClient: React.FC<ReportsClientProps> = ({ data }) => {
  return (
    <>
      <Heading
        title="Dashboard Reports"
        description="An overview of revenue, bookings, and popular times."
      />
      <Separator className="my-6" />
      <ReportSummary summary={data.summary} />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <div className="lg:col-span-2">
          <BookingTrendsChart data={data.bookingTrends} />
        </div>
        <div className="lg:col-span-1">
          <PopularTimeSlots data={data.popularTimeSlots} />
        </div>
      </div>
    </>
  );
};
