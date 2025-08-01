import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FacilitiesErrorStateProps {
  error: string;
}

export function FacilitiesErrorState({ error }: FacilitiesErrorStateProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="p-4">
        <p className="text-destructive text-center">{error}</p>
      </CardContent>
    </Card>
  );
}