import { paymentService } from "@/lib/api/services";
import { PendingPaymentsClient } from "../components/client";
import { Payment } from "@sportefy/db-types";

export default async function PendingPaymentsPage() {
  const pendingPayments = await paymentService.getPendingPayments();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PendingPaymentsClient payments={pendingPayments || []} />
      </div>
    </div>
  );
}
