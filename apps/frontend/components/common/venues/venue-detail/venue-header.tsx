"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { VenueDetails } from "@/lib/api/types";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteVenue } from "@/lib/actions/venue-actions";
import { toast } from "sonner";

interface VenueHeaderProps {
  venue: VenueDetails;
}

export const VenueHeader: React.FC<VenueHeaderProps> = ({ venue }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);
      await deleteVenue(venue.facilityId, venue.id);
      router.refresh();
      router.push(`/dashboard/venues`);
      toast("Venue deleted.");
    } catch (error) {
      toast("Failed to delete venue.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={venue.name ?? "Venue Details"}
          description={venue.address ?? "Manage venue details and bookings"}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/dashboard/venues/${venue.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
    </>
  );
};