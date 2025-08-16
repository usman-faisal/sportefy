"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { venueService, checkInService } from "@/lib/api/services";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

interface CheckIn {
  id: string;
  checkInTime: string;
  checkOutTime: string | null;
  user: {
    profile: {
      name: string;
      email: string;
    };
  };
}

const columns: ColumnDef<CheckIn>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div>
          <p className="font-medium">{user.profile.name}</p>
          <p className="text-sm text-muted-foreground">{user.profile.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "checkInTime",
    header: "Check-in Time",
    cell: ({ row }) => {
      return format(new Date(row.original.checkInTime), "PPpp");
    },
  },
  {
    accessorKey: "checkOutTime",
    header: "Check-out Time",
    cell: ({ row }) => {
      const checkOutTime = row.original.checkOutTime;
      if (!checkOutTime) {
        return <span className="text-green-600 font-medium">Currently Checked In</span>;
      }
      return format(new Date(checkOutTime), "PPpp");
    },
  },
];

export default function CheckInsPage() {
  const params = useParams();
  const venueId = params.venueId as string;
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venueData, checkInsData] = await Promise.all([
          venueService.getVenue(venueId),
          checkInService.getCheckInsByVenue(venueId),
        ]);
        setVenue(venueData);
        setCheckIns(checkInsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venueId]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading check-ins...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/admin/venues/${venueId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Venue
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Check-ins - {venue?.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                View all check-ins for this venue
              </p>
            </div>
          </div>
        </div>

        {/* Check-ins Table */}
        <div className="bg-white rounded-lg shadow">
          <DataTable columns={columns} data={checkIns} />
        </div>
      </div>
    </div>
  );
}