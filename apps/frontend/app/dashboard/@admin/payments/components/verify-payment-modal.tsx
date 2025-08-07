"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentWithUser } from "@/lib/api/types";
import { verifyPayment } from "@/lib/actions/payment-actions";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface VerifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentWithUser;
}

export const VerifyPaymentModal: React.FC<VerifyPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const onVerify = async (status: "verified" | "rejected") => {
    if (status === "rejected" && !rejectionReason) {
      toast("Rejection reason is required.");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyPayment(payment.id, {
        status,
        ...(status === "rejected" && { rejectionReason }),
      });

      if (result.success) {
        toast(`Payment ${status}.`);
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Verify Payment Request"
      description={`Reviewing payment of ${payment.amountCredits} credits from ${payment.user?.fullName}.`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="text-sm">
          <p><strong>User:</strong> {payment.user?.fullName} ({payment.user?.email})</p>
          <p><strong>Amount:</strong> {payment.amountCredits} credits</p>
          <a href={payment.screenshotUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            View Proof of Payment
          </a>
        </div>
        <Textarea
          placeholder="Rejection reason (required if rejecting)..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
        <div className="pt-6 space-x-2 flex items-center justify-end w-full">
          <Button disabled={loading} variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={loading} variant="destructive" onClick={() => onVerify("rejected")}>
            Reject
          </Button>
          <Button disabled={loading} onClick={() => onVerify("verified")}>
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  );
};