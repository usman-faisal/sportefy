import { bookingService } from "@/lib/api/services";
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminDashboardStats from "./components/admin-dashboard-stats";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; date?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "10");
  const date = params.date ? new Date(params.date) : new Date();

  try {
    const bookingOverview = await bookingService.getDailyBookingOverview(
      date,
      page,
      limit
    );

    if (
      !bookingOverview ||
      !bookingOverview.data ||
      bookingOverview.data.length === 0
    ) {
      return (
        <div className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Overview of booking performance and court utilization
              </p>
            </div>

            <Card className="border-dashed">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">
                  No Booking Data Available
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <p className="text-muted-foreground mb-4">
                  No booking data available for today. This could be because:
                </p>
                <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-1">
                  <li>• No bookings have been made yet</li>
                  <li>• The selected date has no activity</li>
                  <li>• Data is still being processed</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <AdminDashboardStats bookingOverview={bookingOverview} />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                Error Loading Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Failed to load booking data. Please try refreshing the page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
