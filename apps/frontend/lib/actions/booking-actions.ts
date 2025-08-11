"use server";

import { revalidatePath } from "next/cache";
import { api, apiPaginated } from "@/lib/api/api";
import { BookingWithRelations } from "@/lib/api/types";

export async function getStaffBookings(filters: {
  status?: string;
  venueId?: string;
  date?: string;
  search?: string;
  facilityIds?: string[];
}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.venueId) params.append("venueId", filters.venueId);
    if (filters.date) params.append("date", filters.date);
    if (filters.search) params.append("search", filters.search);
    
    if (filters.facilityIds && filters.facilityIds.length > 0) {
      filters.facilityIds.forEach(facilityId => {
        params.append("facilityId", facilityId);
      });
    }

    const response = await apiPaginated<BookingWithRelations>(
      `/bookings/staff?${params.toString()}`
    );

    if (response?.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Failed to fetch bookings" };
    }
  } catch (error) {
    console.error("Error fetching staff bookings:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function getStaffBookingStats() {
  try {
    const response = await api<any>("/bookings/staff/stats");
    
    if (response?.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Failed to fetch booking stats" };
    }
  } catch (error) {
    console.error("Error fetching staff booking stats:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function confirmBooking(bookingId: string) {
  try {
    const response = await api(`/bookings/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "confirmed" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response?.success) {
      revalidatePath("/dashboard/staff/bookings");
      revalidatePath(`/dashboard/staff/bookings/${bookingId}`);
      return { success: true, message: "Booking confirmed successfully" };
    } else {
      return { success: false, error: "Failed to confirm booking" };
    }
  } catch (error) {
    console.error("Error confirming booking:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const response = await api(`/bookings/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response?.success) {
      revalidatePath("/dashboard/staff/bookings");
      revalidatePath(`/dashboard/staff/bookings/${bookingId}`);
      return { success: true, message: "Booking cancelled successfully" };
    } else {
      return { success: false, error: "Failed to cancel booking" };
    }
  } catch (error) {
    console.error("Error cancelling booking:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function getBookingDetails(bookingId: string) {
  try {
    const response = await api<any>(`/bookings/${bookingId}`);
    
    if (response?.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Failed to fetch booking details" };
    }
  } catch (error) {
    console.error("Error fetching booking details:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
