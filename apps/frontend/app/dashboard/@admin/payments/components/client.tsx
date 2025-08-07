"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { PaymentWithUser } from "@/lib/api/types";
import { columns } from "./columns";

interface PendingPaymentsClientProps {
  payments: PaymentWithUser[];
}

export const PendingPaymentsClient: React.FC<PendingPaymentsClientProps> = ({ payments }) => {
  return (
    <>
      <Heading
        title={`Pending Payments (${payments.length})`}
        description="Review and verify user top-up requests."
      />
      <Separator />
      <DataTable searchKey="user" columns={columns} data={payments} />
    </>
  );
};