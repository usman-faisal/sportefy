import { bookingService } from "@/lib/api/services";
import React from "react";

export default async function AdminDashboard() {
  const bookingOverview = await bookingService.getDailyBookingOverview(
    new Date()
  );
  console.log(bookingOverview);
  return <div>lskdfjsdklafsdakl;fdkl;ajfsdklajf</div>;
}
