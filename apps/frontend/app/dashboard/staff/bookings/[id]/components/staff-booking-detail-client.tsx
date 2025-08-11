"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import { BookingDetails } from "@/lib/api/types";
import { confirmBooking, cancelBooking } from "@/lib/actions/booking-actions";
import { toast } from "sonner";

interface StaffBookingDetailClientProps {
  booking: BookingDetails;
}

export const StaffBookingDetailClient: React.FC<StaffBookingDetailClientProps> = ({
  booking,
}) => {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const result = await confirmBooking(booking.booking.id);

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
      const result = await cancelBooking(booking.booking.id);

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

  const canConfirm = booking.booking.status === "pending";
  const canCancel = ["pending", "confirmed"].includes(booking.booking.status || "");

  return (
    <>
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

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        {canConfirm && (
          <Button 
            onClick={() => setShowConfirmDialog(true)}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirm Booking
          </Button>
        )}
        
        {canCancel && (
          <Button 
            onClick={() => setShowCancelDialog(true)}
            disabled={loading}
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Booking
          </Button>
        )}
        
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View Schedule
        </Button>
      </div>
    </>
  );
};
