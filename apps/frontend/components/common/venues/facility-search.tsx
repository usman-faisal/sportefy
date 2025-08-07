"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Facility } from "@sportefy/db-types";
import { searchFacilitiesByName } from "@/lib/actions/facility-actions"; // We will create this action next

interface FacilitySearchProps {
  onFacilitySelect: (facilityId: string, facilityName: string) => void;
  initialFacilityName?: string;
}

export function FacilitySearch({
  onFacilitySelect,
  initialFacilityName = "",
}: FacilitySearchProps) {
  const [query, setQuery] = useState(initialFacilityName);
  const [results, setResults] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const response = await searchFacilitiesByName(searchQuery);
    setResults(response || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== initialFacilityName) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery, handleSearch, initialFacilityName]);

  const handleSelect = (facility: Facility) => {
    setQuery(facility.name ?? "");
    setResults([]);
    setShowResults(false);
    onFacilitySelect(facility.id, facility.name ?? "");
  };

  return (
    <div className="relative">
      <Input
        placeholder="Search for a facility by name..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        onFocus={() => setShowResults(true)}
      />
      {showResults && (query.length > 0 || results.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          {isLoading && (
            <div className="p-2 text-sm text-muted-foreground">Searching...</div>
          )}
          {!isLoading && results.length > 0 && (
            <ul>
              {results.map((facility) => (
                <li
                  key={facility.id}
                  className="p-2 cursor-pointer hover:bg-accent"
                  onMouseDown={() => handleSelect(facility)}
                >
                  <p className="font-semibold">{facility.name}</p>
                  <p className="text-sm text-muted-foreground">{facility.address}</p>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && results.length === 0 && query.length > 1 && (
            <div className="p-2 text-sm text-muted-foreground">No facilities found.</div>
          )}
        </div>
      )}
    </div>
  );
}