// lib/actions/venue-actions.ts (Corrected & Updated)

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { venueService, operatingHourService, facilityMediaService } from "@/lib/api/services";
import { CreateVenueDto, UpdateVenueDto } from "@/lib/api/types";
import { Scope, DayOfWeek, MediaType } from "@/lib/types";

type VenueFormData = {
  name: string;
  sportIds: string[];
  basePrice: number;
  capacity: number;
  operatingHours: Array<{
    id?: number;
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
  }>;
  media?: Array<{
    id?: string;
    url: string;
    type: string;
  }>;
};

export async function createVenue(facilityId: string, data: VenueFormData) {
  try {
    const createPayload: CreateVenueDto = {
      ...data,
      media: data.media?.map((m) => ({
        mediaLink: m.url,
        mediaType: m.type as MediaType,
      })) || [],
    };

    const newVenue = await venueService.createVenue(facilityId, createPayload);
    if (!newVenue) {
      throw new Error("API failed to create venue.");
    }
  } catch (error) {
    console.error("Error creating venue:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }

  revalidatePath("/dashboard/venues");
  redirect("/dashboard/venues");
}

export async function updateVenue(facilityId: string, venueId: string, data: VenueFormData) {
  try {
    const updatePayload = {
      name: data.name,
      sportIds: data.sportIds,
      basePrice: data.basePrice,
      capacity: data.capacity,
    };

    const venueUpdatePromise = venueService.updateVenue(facilityId, venueId, updatePayload);

    const operatingHoursPromises: Promise<any>[] = [];
    if (data.operatingHours) {
      const initialHours =
        (await operatingHourService.getOperatingHours(
          venueId,
          Scope.VENUE
        )) || [];

      const hourIdsToDelete = initialHours
        .filter((ih) => !data.operatingHours!.find((h) => h.id === ih.id))
        .map((h) => h.id);

      const hoursToUpdate = data.operatingHours.filter(
        (h) => h.id && initialHours.some((ih) => ih.id === h.id)
      );
      
      const hoursToAdd = data.operatingHours.filter((h) => !h.id);

      if(hourIdsToDelete.length > 0) {
        operatingHoursPromises.push(
            ...hourIdsToDelete.map(id => operatingHourService.deleteOperatingHour(venueId, Scope.VENUE, id))
        );
      }
      if(hoursToUpdate.length > 0) {
        operatingHoursPromises.push(
          ...hoursToUpdate.map(h => operatingHourService.updateOperatingHour(venueId, Scope.VENUE, h.id!, {
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
          })) // Remove the id from the payload, only pass it as the third parameter
        );
      }
      if(hoursToAdd.length > 0) {
        operatingHoursPromises.push(
            operatingHourService.addOperatingHoursBulk(venueId, Scope.VENUE, hoursToAdd)
        );
      }
    }

    const mediaPromises: Promise<any>[] = [];
    if (data.media) {
      const currentMedia = await facilityMediaService.getMedia(venueId, Scope.VENUE) || [];
      
      const mediaIdsToDelete = currentMedia
        .filter((currentM) => !data.media!.find((newM) => newM.id === currentM.id))
        .map((m) => m.id);

      const newMedia = data.media.filter(m => m.url && !m.id);

      if (mediaIdsToDelete.length > 0) {
        mediaPromises.push(
          ...mediaIdsToDelete.map(id => facilityMediaService.deleteMedia(venueId, Scope.VENUE, id))
        );
      }

      if (newMedia.length > 0) {
        const mediaPayload = newMedia.map((m) => ({
          mediaLink: m.url,
          mediaType: m.type as MediaType,
        }));
        
        mediaPromises.push(
          facilityMediaService.addMediaBulk(venueId, Scope.VENUE, mediaPayload)
        );
      }
    }

    await Promise.all([venueUpdatePromise, ...operatingHoursPromises, ...mediaPromises]);

  } catch (error) {
    console.error("Error updating venue:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update venue.";
    return { success: false, error: errorMessage };
  }

  revalidatePath(`/dashboard/venues`);
  revalidatePath(`/dashboard/venues/${venueId}`);
  redirect(`/dashboard/venues/${venueId}`);
}

export async function deleteVenue(facilityId: string, venueId: string) {
  try {
    await venueService.deleteVenue(facilityId, venueId);
  } catch (error) {
    console.error("Error deleting venue:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while deleting the venue.";
    return { success: false, error: errorMessage };
  }
  
  revalidatePath("/dashboard/venues");
  redirect("/dashboard/venues");
}