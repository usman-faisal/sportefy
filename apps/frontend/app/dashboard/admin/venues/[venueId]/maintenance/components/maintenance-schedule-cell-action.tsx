"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";
import { MaintenanceScheduleColumn } from "./columns";
import { deleteMaintenanceSchedule } from "@/lib/actions/maintenance-schedule-actions";

interface MaintenanceScheduleCellActionProps {
  data: MaintenanceScheduleColumn;
}

export const MaintenanceScheduleCellAction: React.FC<MaintenanceScheduleCellActionProps> = ({
  data,
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      
      // Extract venueId from current URL
      const pathSegments = window.location.pathname.split('/');
      const venueIdIndex = pathSegments.indexOf('venues') + 1;
      const venueId = pathSegments[venueIdIndex];
      
      if (!venueId) {
        toast.error("Venue ID not found");
        return;
      }

      const result = await deleteMaintenanceSchedule(venueId, data.id);
      
      if (result.success) {
        toast.success("Maintenance schedule deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete maintenance schedule");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onEdit = () => {
    const pathSegments = window.location.pathname.split('/');
    const venueIdIndex = pathSegments.indexOf('venues') + 1;
    const venueId = pathSegments[venueIdIndex];
    
    if (venueId) {
      router.push(`${window.location.pathname}/edit/${data.id}`);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        title="Delete Maintenance Schedule"
        description="Are you sure you want to delete this maintenance schedule? This action cannot be undone."
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
