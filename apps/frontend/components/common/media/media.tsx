import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import type { Media } from "@sportefy/db-types";

interface MediaProps {
  media: Media[];
}

export function Media({ media }: MediaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Media
        </CardTitle>
      </CardHeader>
      <CardContent>
        {media && media.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {media.map((mediaItem, index) => (
              <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                {mediaItem.mediaLink && (
                  <img
                    src={mediaItem.mediaLink}
                    alt={`Facility media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No media available</p>
        )}
      </CardContent>
    </Card>
  );
}