// components/facility/FacilityDeleteDialog.tsx
"use client";

import React, { useActionState } from "react";
import { useFormState } from "react-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteFacility } from "@/app/actions/facility-actions";

interface FacilityDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  facilityId: string;
  facilityName: string;
}

export function FacilityDeleteDialog({
  isOpen,
  onClose,
  facilityId,
  facilityName,
}: FacilityDeleteDialogProps) {
  const [state, formAction] = useActionState(
    deleteFacility.bind(null, facilityId),
    { error: null as string | null }
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Facility
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{facilityName}</strong>? 
            This action cannot be undone and will permanently remove all 
            associated data including venues, bookings, and media.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {state?.error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
            {state.error}
          </div>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <form action={formAction}>
            <Button
              type="submit"
              variant="destructive"
            >
              Delete Facility
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}