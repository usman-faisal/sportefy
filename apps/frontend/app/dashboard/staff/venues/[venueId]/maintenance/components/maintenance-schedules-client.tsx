"use client";

import { useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Wrench } from "lucide-react";
import { MaintenanceScheduleWithRelations } from "@/lib/api/types";
import { columns, MaintenanceScheduleColumn } from "./columns";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface MaintenanceSchedulesClientProps {
  initialSchedules: MaintenanceScheduleWithRelations[];
  venueId: string;
  venueName: string;
  userType?: "admin" | "staff";
}

export const MaintenanceSchedulesClient: React.FC<MaintenanceSchedulesClientProps> = ({
  initialSchedules,
  venueId,
  venueName,
  userType = "staff",
}) => {
  const [schedules] = useState<MaintenanceScheduleWithRelations[]>(initialSchedules);
  const router = useRouter();

  const formattedSchedules: MaintenanceScheduleColumn[] = schedules.map((schedule) => {
    const startTime = schedule.slot?.startTime ? new Date(schedule.slot.startTime) : null;
    const endTime = schedule.slot?.endTime ? new Date(schedule.slot.endTime) : null;
    
    let duration = "Unknown";
    if (startTime && endTime) {
      const durationMs = endTime.getTime() - startTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        duration = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      } else {
        duration = `${minutes}m`;
      }
    }

    return {
      id: schedule.id,
      reason: schedule.reason || "No reason provided",
      startTime: startTime ? format(startTime, "MMM dd, yyyy 'at' h:mm a") : "Unknown",
      endTime: endTime ? format(endTime, "MMM dd, yyyy 'at' h:mm a") : "Unknown",
      duration,
      scheduledBy: schedule.scheduledByUser?.fullName || "Unknown",
      createdAt: schedule.createdAt ? format(new Date(schedule.createdAt), "MMM dd, yyyy") : "Unknown",
    };
  });

  const onAddNew = () => {
    router.push(`/dashboard/${userType}/venues/${venueId}/maintenance/new`);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Maintenance Schedules (${schedules.length})`}
          description={`Manage maintenance schedules for ${venueName}`}
        />
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>
      <Separator />
      
      {schedules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance schedules</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No maintenance schedules have been created for this venue yet.
              </p>
              <div className="mt-6">
                <Button onClick={onAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule First Maintenance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          searchKey="reason"
          columns={columns}
          data={formattedSchedules}
          pagination={undefined}
        />
      )}
    </>
  );
};
