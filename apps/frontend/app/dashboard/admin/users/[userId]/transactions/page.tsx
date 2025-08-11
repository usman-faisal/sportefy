import { paymentService, userService } from "@/lib/api/services";
import { UserTransactionClient } from "./components/client";
import { notFound } from "next/navigation";

interface UserTransactionsPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserTransactionsPage({
  params,
}: UserTransactionsPageProps) {
  const resolvedParams = await params;
  const [user, transactions] = await Promise.all([
    userService.getUserDetails(resolvedParams.userId),
    paymentService.getUserTransactions(resolvedParams.userId),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UserTransactionClient user={user} transactions={transactions || []} />
      </div>
    </div>
  );
}
