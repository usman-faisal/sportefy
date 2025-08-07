"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { DayOfWeek, MediaEntityType, MediaType } from "@/lib/types";
import { Sport, OperatingHour, Media } from "@sportefy/db-types";
import { updateVenue } from "@/lib/actions/venue-actions";
import { MultiSelect } from "@/components/ui/multi-select";
import { VenueDetails } from "@/lib/api/types";
import { MediaUploader } from "@/components/common/media/media-uploader";

const venueEditSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  basePrice: z.number().min(0, "Base price must be a positive number"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  sportIds: z.array(z.string().uuid()).min(1, "At least one sport must be selected"),
  operatingHours: z.array(
    z.object({
      id: z.number().optional(),
      dayOfWeek: z.nativeEnum(DayOfWeek),
      openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })
  ).min(1, "At least one operating hour is required"),
  media: z.array(
    z.object({
      id: z.string().optional(),
      url: z.string().url("Invalid URL format").or(z.literal("")),
      type: z.string().min(1, "Media type is required"),
    })
  ).optional(),
});

type VenueEditFormData = z.infer<typeof venueEditSchema>;

interface VenueEditFormProps {
  venue: VenueDetails;
  sports: Sport[];
  initialOperatingHours: OperatingHour[];
  initialMedia: Media[];
}

export function VenueEditForm({ venue, sports, initialOperatingHours, initialMedia }: VenueEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<VenueEditFormData>({
    resolver: zodResolver(venueEditSchema),
    defaultValues: {
      name: venue.name || "",
      basePrice: Number(venue.basePrice) || 0,
      capacity: Number(venue.capacity) || 1,
      sportIds: venue.sports?.map(s => s.id) || [],
      operatingHours: initialOperatingHours?.map(oh => ({
        id: oh.id,
        dayOfWeek: oh.dayOfWeek as DayOfWeek,
        openTime: oh.openTime || "00:00",
        closeTime: oh.closeTime || "00:00",
      })) || [],
      media: initialMedia?.map((m) => ({
          id: m.id,
          url: m.mediaLink ?? "",
          type: m.mediaType ?? MediaType.IMAGE,
        })) || [],
    },
  });

  const { fields: operatingHoursFields, append: appendOperatingHour, remove: removeOperatingHour } = useFieldArray({
    control: form.control,
    name: "operatingHours",
  });
  
  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control: form.control,
    name: "media",
  });

  const onSubmit = async (data: VenueEditFormData) => {
    setError(null);
    
    // Only send the basic venue properties that the backend UpdateVenueDto supports
    const payload = {
      name: data.name,
      sportIds: data.sportIds,
      basePrice: Number(data.basePrice),
      capacity: Number(data.capacity),
      operatingHours: data.operatingHours,
      media: data.media?.filter((m) => m.url).map(m => ({ 
        url: m.url, 
        type: m.type 
      })) || [],
    };
    
    const result = await updateVenue(venue.facilityId, venue.id, payload);
    if (result?.error) {
      setError(result.error);
    }
  };

  const sportOptions = sports.map(sport => ({
    value: sport.id,
    label: sport.name,
  }));

  if (!isClient) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Edit Venue" description={`Update details for ${venue.name}`} />
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
           {error && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
              <CardDescription>Update the details for this venue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField 
                  control={form.control} 
                  name="name" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="basePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (per hour)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value?.toString() || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="capacity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value?.toString() || ""}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 1 : value);
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="sportIds" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sports</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={sportOptions}
                      onValueChange={field.onChange}
                      value={field.value}
                      placeholder="Select sports available in this venue..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">Operating Hours
                <Button type="button" variant="outline" size="sm" onClick={() => appendOperatingHour({ dayOfWeek: DayOfWeek.MONDAY, openTime: "09:00", closeTime: "17:00" })}>
                  <Plus className="h-4 w-4 mr-2" />Add
                </Button>
              </CardTitle>
              <CardDescription>Update the operating hours for this specific venue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {operatingHoursFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField 
                      control={form.control} 
                      name={`operatingHours.${index}.dayOfWeek`} 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button type="button" variant="outline" size="sm" onClick={() => appendMedia({ url: "", type: "image" })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Media Slot
                </Button>
              </CardTitle>
              <CardDescription>Upload images or videos for the venue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mediaFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <MediaUploader
                      initialUrl={field.url}
                      mediaEntityType={MediaEntityType.VENUE}
                      onUploadComplete={(url, type) => {
                        form.setValue(`media.${index}.url`, url, { shouldValidate: true });
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
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Form>
    </>
  );
}