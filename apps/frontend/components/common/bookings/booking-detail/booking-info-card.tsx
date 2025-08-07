import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookingWithRelations } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";

interface BookingInfoCardProps {
  booking: BookingWithRelations;
}

export const BookingInfoCard: React.FC<BookingInfoCardProps> = ({ booking }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Details</CardTitle>
        <CardDescription>
          ID: {booking.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
            {booking.status}
          </Badge>
        </div>
        <Separator />
        <div className="space-y-3 text-sm">
            <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Booked by: <strong>{booking.bookedByProfile?.fullName || 'N/A'}</strong></span>
            </div>
            <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Venue: 
                    <Link href={`/dashboard/admin/venues/${booking.venue?.id}`} className="font-semibold text-primary hover:underline ml-1">
                        {booking.venue?.name || 'N/A'}
                    </Link>
                </span>
            </div>
            <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Created on: <strong>{new Date(booking.createdAt!).toLocaleDateString()}</strong></span>
            </div>
             <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Total Price: <strong>{booking.totalCredits} credits</strong></span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};