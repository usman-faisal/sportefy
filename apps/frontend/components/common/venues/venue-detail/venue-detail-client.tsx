"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { VenueDetails } from "@/lib/api/types";
import { VenueHeader } from "./venue-header";
import { VenueStats } from "./venue-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookingList from "../../bookings/booking-list/booking-list";

interface VenueDetailClientProps {
  venue: VenueDetails;
}

export const VenueDetailClient: React.FC<VenueDetailClientProps> = ({
  venue,
}) => {
  return (
    <>
      <VenueHeader venue={venue} />
      <Separator className="my-6" />
      <VenueStats venue={venue} />
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingList bookings={venue.bookings || []} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};
