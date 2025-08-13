"use server";

import { revalidatePath } from "next/cache";
import { maintenanceScheduleService } from "@/lib/api/services";
import { CreateMaintenanceScheduleDto, UpdateMaintenanceScheduleDto } from "@/lib/api/types";

export async function getMaintenanceSchedules(venueId: string) {
  try {
    const schedules = await maintenanceScheduleService.getMaintenanceSchedules(venueId);
    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching maintenance schedules:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function createMaintenanceSchedule(
  venueId: string,
  data: CreateMaintenanceScheduleDto
) {
  try {
    const schedule = await maintenanceScheduleService.createMaintenanceSchedule(venueId, data);
    if (schedule) {
      revalidatePath(`/dashboard/staff/venues/${venueId}/maintenance`);
      revalidatePath(`/dashboard/admin/venues/${venueId}/maintenance`);
      revalidatePath(`/dashboard/staff/venues/${venueId}`);
      revalidatePath(`/dashboard/admin/venues/${venueId}`);
      return { success: true, data: schedule };
    } else {
      return { success: false, error: "Failed to create maintenance schedule" };
    }
  } catch (error) {
    console.error("Error creating maintenance schedule:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function updateMaintenanceSchedule(
  venueId: string,
  maintenanceId: string,
  data: UpdateMaintenanceScheduleDto
) {
  try {
    const schedule = await maintenanceScheduleService.updateMaintenanceSchedule(
      venueId,
      maintenanceId,
      data
    );
    
    if (schedule) {
      revalidatePath(`/dashboard/staff/venues/${venueId}/maintenance`);
      revalidatePath(`/dashboard/admin/venues/${venueId}/maintenance`);
      revalidatePath(`/dashboard/staff/venues/${venueId}`);
      revalidatePath(`/dashboard/admin/venues/${venueId}`);
      return { success: true, data: schedule };
    } else {
      return { success: false, error: "Failed to update maintenance schedule" };
    }
  } catch (error) {
    console.error("Error updating maintenance schedule:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function deleteMaintenanceSchedule(
  venueId: string,
  maintenanceId: string
) {
  try {
    const success = await maintenanceScheduleService.deleteMaintenanceSchedule(
      venueId,
      maintenanceId
    );
    
    if (success) {
      revalidatePath(`/dashboard/staff/venues/${venueId}/maintenance`);
      revalidatePath(`/dashboard/admin/venues/${venueId}/maintenance`);
      revalidatePath(`/dashboard/staff/venues/${venueId}`);
      revalidatePath(`/dashboard/admin/venues/${venueId}`);
      return { success: true };
    } else {
      return { success: false, error: "Failed to delete maintenance schedule" };
    }
  } catch (error) {
    console.error("Error deleting maintenance schedule:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
