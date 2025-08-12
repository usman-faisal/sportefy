"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  facilityService,
  operatingHourService,
  facilityMediaService,
} from "@/lib/api/services";
import { Scope, DayOfWeek, MediaType } from "../types";
import { CreateOperatingHourDto } from "../api/types";
import { Facility } from "@sportefy/db-types";

type FacilityCreateData = {
  name: string;
  description: string;
  phoneNumber: string;
  address: string;
  operatingHours: Array<{
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
  }>;
  media: Array<{
    url: string;
    type: string;
  }>;
};

type FacilityUpdateData = {
  name?: string;
  description?: string;
  phoneNumber?: string;
  address?: string;
  operatingHours: Array<{
    id?: number;
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
  }>;
  media: Array<{
    id?: string;
    url: string;
    type: string;
  }>;
};

export async function createFacility(data: FacilityCreateData) {
  try {
    const createPayload = {
      name: data.name,
      description: data.description,
      phoneNumber: data.phoneNumber,
      address: data.address,
      operatingHours: data.operatingHours,
      media: data.media.map((m) => ({
        mediaLink: m.url,
        mediaType: m.type,
      })),
    };

    const result = await facilityService.createFacility({
      ...createPayload,
      operatingHours: data.operatingHours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
      })),
      media: data.media.map((m) => ({
        mediaLink: m.url,
        mediaType: m.type as MediaType,
      })),
    });

    if (!result) {
      return { success: false, error: "API failed to create facility" };
    }
  } catch (error) {
    console.error("Error creating facility:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
  revalidatePath("/dashboard/facilities");
  redirect(`/dashboard/facilities`);
}

export async function updateFacility(
  facilityId: string,
  data: FacilityUpdateData
) {
  try {
    const facilityUpdatePromise = facilityService.updateFacility(facilityId, {
      name: data.name,
      description: data.description,
      phoneNumber: data.phoneNumber,
      address: data.address,
    });

    const initialHours =
      (await operatingHourService.getOperatingHours(
        facilityId,
        Scope.FACILITY
      )) || [];
    const initialMedia =
      (await facilityMediaService.getMedia(facilityId, Scope.FACILITY)) || [];

    const hourIdsToDelete = initialHours
      .filter((ih) => !data.operatingHours.find((h) => h.id === ih.id))
      .map((h) => h.id);

    const hoursToUpdate = data.operatingHours.filter(
      (h) => h.id && initialHours.some((ih) => ih.id === h.id)
    );

    const hoursToAdd = data.operatingHours.filter((h) => !h.id);

    const mediaIdsToDelete = initialMedia
      .filter((im) => !data.media.find((m) => m.id === im.id))
      .map((m) => m.id);

    const mediaToAdd = data.media.filter((m) => !m.id);

    const promises = [
      facilityUpdatePromise,

      ...hourIdsToDelete.map((id) =>
        operatingHourService.deleteOperatingHour(facilityId, Scope.FACILITY, id)
      ),
      ...hoursToUpdate.map((h) =>
        operatingHourService.updateOperatingHour(
          facilityId,
          Scope.FACILITY,
          h.id!,
          {
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
          }
        )
      ),
      ...hoursToAdd.map((h) =>
        operatingHourService.addOperatingHour(facilityId, Scope.FACILITY, {
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
        } as CreateOperatingHourDto)
      ),

      ...mediaIdsToDelete.map((id) =>
        facilityMediaService.deleteMedia(facilityId, Scope.FACILITY, id)
      ),
      ...mediaToAdd.map((m) =>
        facilityMediaService.addMedia(facilityId, Scope.FACILITY, {
          mediaLink: m.url,
          mediaType: m.type,
        })
      ),
    ];

    await Promise.all(promises);

    revalidatePath(`/dashboard/facilities/${facilityId}`);
    revalidatePath(`/dashboard/facilities`);

    return { success: true };
  } catch (error) {
    console.error("Error updating facility:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update facility.";
    return { success: false, error: errorMessage };
  }
}

export async function deleteFacility(facilityId: string) {
  try {
    await facilityService.deleteFacility(facilityId);
    revalidatePath("/dashboard/facilities");
  } catch (error) {
    console.error("Error deleting facility:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while deleting the facility.";
    return { success: false, error: errorMessage };
  }
  redirect("/dashboard/facilities");
}

export async function searchFacilitiesByName(
  nameQuery: string
): Promise<Facility[] | null> {
  if (!nameQuery || nameQuery.trim().length < 1) {
    return null;
  }

  try {
    const facilities = await facilityService.getAllFacilities({
      name: nameQuery,
      limit: 10,
    });
    return facilities?.data || null;
  } catch (error) {
    console.error("Failed to search for facilities:", error);
    return null;
  }
}
