"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, X } from "lucide-react";
import { updateFacility } from "@/lib/actions/facility-actions";
import { DayOfWeek, MediaType } from "@/lib/types";
import { Media, OperatingHour } from "@sportefy/db-types";
import { FacilityDetails } from "@/lib/api/types";

const facilityEditSchema = z.object({
  name: z.string().min(1, "Facility name is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  operatingHours: z.array(
    z.object({
      id: z.number().optional(),
      dayOfWeek: z.nativeEnum(DayOfWeek),
      openTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      closeTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })
  ),
  media: z.array(
    z.object({
      id: z.string().optional(),
      url: z.string().url("Invalid URL format").or(z.literal("")),
      type: z.string().min(1, "Media type is required"),
    })
  ),
});

type FacilityEditFormData = z.infer<typeof facilityEditSchema>;

export function FacilityEditForm({
  facility,
  initialOperatingHours,
  initialMedia,
}: {
  facility: FacilityDetails;
  initialOperatingHours: OperatingHour[];
  initialMedia: Media[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FacilityEditFormData>({
    resolver: zodResolver(facilityEditSchema),
    defaultValues: {
      name: facility.name || "",
      description: facility.description || "",
      phoneNumber: facility.phoneNumber || "",
      address: facility.address || "",
      operatingHours:
        initialOperatingHours?.map((oh) => ({
          id: oh.id,
          dayOfWeek: oh.dayOfWeek as DayOfWeek,
          openTime: oh.openTime ?? "",
          closeTime: oh.closeTime ?? "",
        })) || [],
      media:
        initialMedia?.map((m) => ({
          id: m.id,
          url: m.mediaLink ?? "",
          type: m.mediaType ?? MediaType.IMAGE,
        })) || [],
    },
  });

  const {
    fields: operatingHoursFields,
    append: appendOperatingHour,
    remove: removeOperatingHour,
  } = useFieldArray({
    control: form.control,
    name: "operatingHours",
  });

  const {
    fields: mediaFields,
    append: appendMedia,
    remove: removeMedia,
  } = useFieldArray({
    control: form.control,
    name: "media",
  });

  const onSubmit = async (data: FacilityEditFormData) => {
    setError(null);

    const result = await updateFacility(facility.id, data);
    if (result.success) {
      router.push(`/dashboard/facilities/${facility.id}`);
      router.refresh();
    } else {
      setError(result.error || "An unknown error occurred.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Facility Information</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-100 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Operating Hours
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendOperatingHour({
                    dayOfWeek: DayOfWeek.MONDAY,
                    openTime: "09:00",
                    closeTime: "17:00",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {operatingHoursFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`operatingHours.${index}.dayOfWeek`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(DayOfWeek).map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`operatingHours.${index}.openTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`operatingHours.${index}.closeTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Close Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {operatingHoursFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOperatingHour(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Media
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendMedia({ url: "", type: "image" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mediaFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`media.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="Enter media URL"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`media.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select media type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMedia(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
