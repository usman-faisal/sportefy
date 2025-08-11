import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PopularTimeSlot } from "@/lib/api/types";

interface PopularTimeSlotsProps {
  data: PopularTimeSlot[];
}

export const PopularTimeSlots: React.FC<PopularTimeSlotsProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Time Slots</CardTitle>
        <CardDescription>The most frequently booked times.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No booking data available.
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((slot, index) => (
              <div key={index} className="flex items-center">
                <p className="text-sm font-medium leading-none">{slot.time}</p>
                <div className="ml-auto font-medium">
                  {slot.bookings} bookings
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
