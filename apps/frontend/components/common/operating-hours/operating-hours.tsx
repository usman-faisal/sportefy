import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { OperatingHour } from "@sportefy/db-types";

interface OperatingHourProps {
  operatingHours: OperatingHour[]
}

export function OperatingHours({ operatingHours }: OperatingHourProps) {
  const getDayName = (dayOfWeek: string | null) => {
    if (!dayOfWeek) return "Unknown";
    return dayOfWeek;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Operating Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        {operatingHours && operatingHours.length > 0 ? (
          <div className="space-y-3">
            {operatingHours.map((hour, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getDayName(hour.dayOfWeek)}</span>
                  <Badge variant="outline">
                    {hour.openTime && hour.closeTime ? "Open" : "Closed"}
                  </Badge>
                </div>
                {hour.openTime && hour.closeTime && (
                  <div className="text-sm text-muted-foreground">
                    {formatTime(hour.openTime)} - {formatTime(hour.closeTime)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No operating hours set</p>
        )}
      </CardContent>
    </Card>
  );
}