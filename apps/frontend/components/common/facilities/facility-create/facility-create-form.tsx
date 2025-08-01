"use client";

import React, { useState } from "react";
import { CreateOperatingHourDto, CreateMediaDto } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { createFacility } from "@/app/actions/facility-actions";
import { useFormState } from "react-dom";

interface FacilityCreateFormProps {
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function FacilityCreateForm({ onCancel }: FacilityCreateFormProps) {
  const [operatingHours, setOperatingHours] = useState<CreateOperatingHourDto[]>([
    { dayOfWeek: 1, openTime: "09:00", closeTime: "17:00" }
  ]);
  const [media, setMedia] = useState<CreateMediaDto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const formData = new FormData();
    formData.append("name", (document.getElementById("name") as HTMLInputElement)?.value || "");
    formData.append("ownerId", (document.getElementById("ownerId") as HTMLInputElement)?.value || "");
    formData.append("description", (document.getElementById("description") as HTMLTextAreaElement)?.value || "");
    formData.append("phoneNumber", (document.getElementById("phoneNumber") as HTMLInputElement)?.value || "");
    formData.append("address", (document.getElementById("address") as HTMLInputElement)?.value || "");

    if (!formData.get("name")) {
      newErrors.name = "Name is required";
    }
    if (!formData.get("ownerId")) {
      newErrors.ownerId = "Owner ID is required";
    }
    if (!formData.get("description")) {
      newErrors.description = "Description is required";
    }
    if (!formData.get("phoneNumber")) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!formData.get("address")) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("name", (document.getElementById("name") as HTMLInputElement)?.value || "");
    formData.append("ownerId", (document.getElementById("ownerId") as HTMLInputElement)?.value || "");
    formData.append("description", (document.getElementById("description") as HTMLTextAreaElement)?.value || "");
    formData.append("phoneNumber", (document.getElementById("phoneNumber") as HTMLInputElement)?.value || "");
    formData.append("address", (document.getElementById("address") as HTMLInputElement)?.value || "");
    formData.append("operatingHours", JSON.stringify(operatingHours));
    formData.append("media", JSON.stringify(media));

    await createFacility(formData);
  };

  const addOperatingHour = () => {
    setOperatingHours([...operatingHours, { dayOfWeek: 1, openTime: "09:00", closeTime: "17:00" }]);
  };

  const removeOperatingHour = (index: number) => {
    if (operatingHours.length > 1) {
      setOperatingHours(operatingHours.filter((_, i) => i !== index));
    }
  };

  const updateOperatingHour = (index: number, field: keyof CreateOperatingHourDto, value: string | number) => {
    const newHours = operatingHours.map((hour, i) => 
      i === index ? { ...hour, [field]: value } : hour
    );
    setOperatingHours(newHours);
  };

  const addMedia = () => {
    setMedia([...media, { url: "", type: "" }]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const updateMedia = (index: number, field: keyof CreateMediaDto, value: string) => {
    const newMedia = media.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setMedia(newMedia);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the basic details of the facility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Facility Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter facility name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner ID</Label>
              <Input
                id="ownerId"
                name="ownerId"
                placeholder="Enter owner UUID"
              />
              {errors.ownerId && (
                <p className="text-sm text-red-500">{errors.ownerId}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter facility description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter facility address"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>Set the operating hours for each day of the week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {operatingHours.map((hour, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Day</Label>
                  <select
                    value={hour.dayOfWeek}
                    onChange={(e) => updateOperatingHour(index, "dayOfWeek", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Open Time</Label>
                  <Input
                    type="time"
                    value={hour.openTime}
                    onChange={(e) => updateOperatingHour(index, "openTime", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Close Time</Label>
                  <Input
                    type="time"
                    value={hour.closeTime}
                    onChange={(e) => updateOperatingHour(index, "closeTime", e.target.value)}
                  />
                </div>
              </div>

              {operatingHours.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOperatingHour(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addOperatingHour}>
            <Plus className="h-4 w-4 mr-2" />
            Add Operating Hour
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>Add media files for the facility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {media.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    type="url"
                    value={item.url}
                    onChange={(e) => updateMedia(index, "url", e.target.value)}
                    placeholder="Enter media URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={item.type}
                    onChange={(e) => updateMedia(index, "type", e.target.value)}
                    placeholder="Enter media type"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeMedia(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addMedia}>
            <Plus className="h-4 w-4 mr-2" />
            Add Media
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Facility
        </Button>
      </div>
    </form>
  );
} 