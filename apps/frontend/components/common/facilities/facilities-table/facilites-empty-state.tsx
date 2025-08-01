import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";

interface FacilitiesEmptyStateProps {
  searchQuery: string;
  onAddFacility?: () => void;
}

export function FacilitiesEmptyState({ searchQuery, onAddFacility }: FacilitiesEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No facilities found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "No facilities match your search criteria."
              : "Get started by adding your first facility."
            }
          </p>
          {!searchQuery && (
            <Button onClick={onAddFacility}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Facility
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}