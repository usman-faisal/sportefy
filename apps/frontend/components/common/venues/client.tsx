"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { VenueColumn, columns } from "./columns";

interface VenueClientProps {
  data: VenueColumn[];
}

export const VenueClient: React.FC<VenueClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Venues (${data.length})`}
          description="Manage venues for your facilities"
        />
        <Button onClick={() => router.push(`/dashboard/venues/create`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable  columns={columns} data={data} />
    </>
  );
};