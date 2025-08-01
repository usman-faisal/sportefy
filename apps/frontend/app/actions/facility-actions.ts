"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { facilityService } from "@/lib/api/services";
import { UpdateFacilityDto, CreateFacilityDto } from "@/lib/api/types";

export async function createFacility(formData: FormData) {
  try {
    const createData: CreateFacilityDto = {
      name: formData.get("name") as string,
      ownerId: formData.get("ownerId") as string,
      description: formData.get("description") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      address: formData.get("address") as string,
      operatingHours: JSON.parse(formData.get("operatingHours") as string || "[]"),
      media: JSON.parse(formData.get("media") as string || "[]"),
    };

    const result = await facilityService.createFacility(createData);
    
    if (result) {
      revalidatePath("/dashboard/admin/facilities");
      redirect(`/dashboard/admin/facilities/${result.id}`);
    } else {
      return { error: "Failed to create facility" };
    }
  } catch (error) {
    console.error("Error creating facility:", error);
    return { error: "An error occurred while creating the facility" };
  }
}

export async function updateFacility(
  facilityId: string,
  formData: FormData
) {
  try {
    const updateData: UpdateFacilityDto = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };

    const result = await facilityService.updateFacility(facilityId, updateData);
    
    if (result) {
      revalidatePath(`/dashboard/admin/facilities/${facilityId}`);
      return { success: true, facilityId };
    } else {
      return { error: "Failed to update facility" };
    }
  } catch (error) {
    console.error("Error updating facility:", error);
    return { error: "An error occurred while updating the facility" };
  }
}

export async function deleteFacility(facilityId: string) {
  try {
    console.log(facilityId, "Deleting facility with ID");
    const success = await facilityService.deleteFacility(facilityId);
    
    if (success) {
      revalidatePath("/dashboard/admin/facilities");
      redirect("/dashboard/admin/facilities");
    } else {
      return { error: "Failed to delete facility" };
    }
  } catch (error) {
    console.error("Error deleting facility:", error);
    return { error: "An error occurred while deleting the facility" };
  }
}
