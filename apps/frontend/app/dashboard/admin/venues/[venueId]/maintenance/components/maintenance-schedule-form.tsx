"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MaintenanceScheduleWithRelations } from "@/lib/api/types";
import { 
  createMaintenanceSchedule, 
  updateMaintenanceSchedule 
} from "@/lib/actions/maintenance-schedule-actions";

const formSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason is too long"),
  date: z.date({
    message: "Date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    const start = new Date(`2000-01-01T${data.startTime}`);
    const end = new Date(`2000-01-01T${data.endTime}`);
    return end > start;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type FormData = z.infer<typeof formSchema>;

interface MaintenanceScheduleFormProps {
  initialData?: MaintenanceScheduleWithRelations | null;
  venueId: string;
  venueName: string;
  userType?: "admin" | "staff";
}

export const MaintenanceScheduleForm: React.FC<MaintenanceScheduleFormProps> = ({
  initialData,
  venueId,
  venueName,
  userType = "admin",
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Maintenance Schedule" : "Schedule Maintenance";
  const description = initialData 
    ? `Edit maintenance schedule for ${venueName}`
    : `Schedule maintenance for ${venueName}`;
  const toastMessage = initialData 
    ? "Maintenance schedule updated successfully" 
    : "Maintenance schedule created successfully";
  const action = initialData ? "Save changes" : "Schedule maintenance";

  // Generate time options (every 30 minutes from 6 AM to 11 PM)
  const timeOptions: { value: string; label: string }[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
      timeOptions.push({ value: timeString, label: displayTime });
    }
  }

  const defaultValues: Partial<FormData> = initialData
    ? {
        reason: initialData.reason || "",
        date: initialData.slot?.startTime ? new Date(initialData.slot.startTime) : undefined,
        startTime: initialData.slot?.startTime 
          ? format(new Date(initialData.slot.startTime), 'HH:mm')
          : "",
        endTime: initialData.slot?.endTime 
          ? format(new Date(initialData.slot.endTime), 'HH:mm')
          : "",
      }
    : {
        reason: "",
        date: undefined,
        startTime: "",
        endTime: "",
      };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Combine date and time to create ISO strings
      const startDateTime = new Date(data.date);
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(data.date);
      const [endHour, endMinute] = data.endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      const payload = {
        reason: data.reason,
        slot: {
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        },
      };

      let result;
      if (initialData) {
        result = await updateMaintenanceSchedule(venueId, initialData.id, payload);
      } else {
        result = await createMaintenanceSchedule(venueId, payload);
      }

      if (result.success) {
        toast.success(toastMessage);
        router.push(`/dashboard/${userType}/venues/${venueId}/maintenance`);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    router.push(`/dashboard/${userType}/venues/${venueId}/maintenance`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Maintenance</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the reason for this maintenance schedule..."
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  Provide a clear description of why this maintenance is needed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select the date for the maintenance schedule.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {action}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
