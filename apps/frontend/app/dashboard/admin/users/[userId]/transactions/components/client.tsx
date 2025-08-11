"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Profile, Transaction } from "@sportefy/db-types";
import { columns } from "./columns";

interface UserTransactionClientProps {
  user: Profile;
  transactions: Transaction[];
}

export const UserTransactionClient: React.FC<UserTransactionClientProps> = ({ user, transactions }) => {
  return (
    <>
      <Heading
        title={`Transaction History`}
        description={`Viewing all transactions for ${user.fullName}. Current Balance: ${user.credits} credits.`}
      />
      <Separator />
      <DataTable searchKey="type" columns={columns} data={transactions} />
    </>
  );
};