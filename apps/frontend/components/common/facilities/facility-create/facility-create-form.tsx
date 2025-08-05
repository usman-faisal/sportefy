"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Plus, Trash2 } from "lucide-react";
import { createFacility } from "@/lib/actions/facility-actions";
import { OwnerSearch } from "./owner-search";
import { DayOfWeek, MediaEntityType } from "@/lib/types";
import { MediaUploader } from "../../media/media-uploader";

const facilitySchema = z.object({
  name: z.string().min(1, "Facility name is required"),
  ownerId: z
    .string()
    .uuid(
      "Valid owner ID is required. Please select an owner from the search."
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  operatingHours: z
    .array(
      z.object({
        dayOfWeek: z.nativeEnum(DayOfWeek),
        openTime: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
        closeTime: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      })
    )
    .min(1, "At least one operating hour is required"),
  media: z.array(
    z.object({
      url: z.string().url("Invalid URL format").or(z.literal("")),
      type: z.string().min(1, "Media type is required"),
    })
  ),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

export function FacilityCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: "",
      ownerId: "",
      description: "",
      phoneNumber: "",
      address: "",
      operatingHours: [
        { dayOfWeek: DayOfWeek.MONDAY, openTime: "09:00", closeTime: "17:00" },
      ],
      media: [],
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

  const handleOwnerSelect = (ownerId: string) => {
    form.setValue("ownerId", ownerId, { shouldValidate: true });
  };

  const onSubmit = async (data: FacilityFormData) => {
    setError(null);
    const result = await createFacility(data);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-100 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details of the facility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter facility name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerId"
                render={() => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <OwnerSearch onOwnerSelect={handleOwnerSelect} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter facility description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter facility address" {...field} />
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
                Add Media Slot
              </Button>
            </CardTitle>
            <CardDescription>
              Upload images or videos for the facility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mediaFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No media slots added yet.</p>
              </div>
            ) : (
              mediaFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <MediaUploader
                      initialUrl={field.url}
                      mediaEntityType={MediaEntityType.FACILITY}
                      onUploadComplete={(url, type) => {
                        form.setValue(`media.${index}.url`, url, {
                          shouldValidate: true,
                        });
                        form.setValue(`media.${index}.type`, type);
                      }}
                    />
                    <FormField
                      control={form.control}
                      name={`media.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
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
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create Facility"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
