"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { BookingColumn } from "./columns";
import { confirmBooking, cancelBooking } from "@/lib/actions/booking-actions";
import { toast } from "sonner";

interface StaffBookingCellActionProps {
  data: BookingColumn;
}

export const StaffBookingCellAction: React.FC<StaffBookingCellActionProps> = ({
  data,
}) => {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleViewDetails = () => {
    router.push(`/dashboard/staff/bookings/${data.id}`);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const result = await confirmBooking(data.id);

      if (result.success) {
        toast.success(result.message || "Booking confirmed successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to confirm booking");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("An error occurred while confirming the booking");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      const result = await cancelBooking(data.id);

      if (result.success) {
        toast.success(result.message || "Booking cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("An error occurred while cancelling the booking");
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  const canConfirm = data.status === "pending";
  const canCancel = data.status === "pending" || data.status === "confirmed";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          {canConfirm && (
            <DropdownMenuItem 
              onClick={() => setShowConfirmDialog(true)}
              className="text-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Booking
            </DropdownMenuItem>
          )}

          {canCancel && (
            <DropdownMenuItem 
              onClick={() => setShowCancelDialog(true)}
              className="text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Booking
            </DropdownMenuItem>
          )}

          <DropdownMenuItem>
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this booking? This will notify the customer and lock in their reservation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Confirming..." : "Confirm Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone and may result in credit refunds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Cancelling..." : "Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
