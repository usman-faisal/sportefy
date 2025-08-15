"use client";

import React, { useState } from "react";
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
import { DayOfWeek, MediaEntityType } from "@/lib/types";
import { Sport } from "@sportefy/db-types";
import { createVenue } from "@/lib/actions/venue-actions";
import { MultiSelect } from "@/components/ui/multi-select";
import { FacilitySearch } from "@/components/common/venues/facility-search";
import { MediaUploader } from "@/components/common/media/media-uploader";
import { LocationMap } from "@/components/common/venues/location-map";

const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  basePrice: z.number().min(0, "Base price must be a positive number"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  availability: z.enum(['active', 'inactive', 'maintenance']),
  sportIds: z.array(z.string().uuid()).min(1, "At least one sport must be selected"),
  operatingHours: z.array(
    z.object({
      dayOfWeek: z.nativeEnum(DayOfWeek),
      openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })
  ).min(1, "At least one operating hour is required"),
  media: z.array(
    z.object({
      url: z.string().url("Invalid URL format").or(z.literal("")),
      type: z.string().min(1, "Media type is required"),
    })
  ).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type VenueFormData = z.infer<typeof venueSchema>;

interface VenueCreateFormProps {
  sports: Sport[];
}

export function VenueCreateForm({ sports }: VenueCreateFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const form = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: "",
      basePrice: 0,
      capacity: 1,
      availability: 'active',
      sportIds: [],
      operatingHours: [{ dayOfWeek: DayOfWeek.MONDAY, openTime: "09:00", closeTime: "17:00" }],
      media: [],
      latitude: undefined,
      longitude: undefined,
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

  const onSubmit = async (data: VenueFormData) => {
    setError(null);
    if (!selectedFacilityId) {
        setError("You must select a facility.");
        return;
    }

    const payload = {
      ...data,
      media: data.media?.filter((m) => m.url) || [],
    };
    
    const result = await createVenue(selectedFacilityId, payload);

    if (result?.error) {
      setError(result.error);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    form.setValue('latitude', lat);
    form.setValue('longitude', lng);
  };

  const sportOptions = sports.map(sport => ({
    value: sport.id,
    label: sport.name,
  }));

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Create Venue" description="Add a new venue to a facility" />
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
           {error && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
              <CardDescription>Provide the basic details for the new venue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Venue Name</FormLabel>
                          <FormControl><Input placeholder="e.g., Court 1, Field A" {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                   <FormItem>
                       <FormLabel>Facility</FormLabel>
                       <FacilitySearch onFacilitySelect={(id) => setSelectedFacilityId(id)} />
                       {!selectedFacilityId && form.formState.isSubmitted && (
                           <p className="text-sm font-medium text-destructive">Please select a facility.</p>
                       )}
                   </FormItem>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="basePrice" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Base Price (per hour)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
                            onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="availability" render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="sportIds" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sports</FormLabel>
                    <FormControl>
                        <MultiSelect
                            options={sportOptions}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            placeholder="Select sports available in this venue..."
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
            </CardContent>
          </Card>
          
          <LocationMap
            onLocationSelect={handleLocationSelect}
            className="w-full"
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">Operating Hours
                <Button type="button" variant="outline" size="sm" onClick={() => appendOperatingHour({ dayOfWeek: DayOfWeek.MONDAY, openTime: "09:00", closeTime: "17:00" })}>
                  <Plus className="h-4 w-4 mr-2" />Add
                </Button>
              </CardTitle>
              <CardDescription>Set the operating hours for this specific venue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {operatingHoursFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name={`operatingHours.${index}.dayOfWeek`} render={({ field }) => (<FormItem><FormLabel>Day</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl><SelectContent>{Object.values(DayOfWeek).map((day) => (<SelectItem key={day} value={day}>{day}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`operatingHours.${index}.openTime`} render={({ field }) => (<FormItem><FormLabel>Open Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`operatingHours.${index}.closeTime`} render={({ field }) => (<FormItem><FormLabel>Close Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  {operatingHoursFields.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => removeOperatingHour(index)}><Trash2 className="h-4 w-4" /></Button>)}
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
                   <FormField control={form.control} name={`media.${index}.url`} render={({ field }) => (<FormItem className="hidden"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMedia(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating..." : "Create Venue"}</Button>
          </div>
        </form>
      </Form>
    </>
  );
}