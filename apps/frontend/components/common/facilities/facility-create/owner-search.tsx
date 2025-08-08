"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { searchUsersByEmail } from "@/lib/actions/user-actions";
import { useDebounce } from "@/hooks/use-debounce";
import { Profile, User } from "@sportefy/db-types";

interface OwnerSearchProps {
  onOwnerSelect: (ownerId: string, ownerEmail: string) => void;
  initialOwnerEmail?: string;
}

export function OwnerSearch({
  onOwnerSelect,
  initialOwnerEmail = "",
}: OwnerSearchProps) {
  const [query, setQuery] = useState(initialOwnerEmail);
  const [results, setResults] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const response = await searchUsersByEmail(searchQuery);
    if (!response || !response.data) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setResults(response?.data.flat());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== initialOwnerEmail) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery, handleSearch, initialOwnerEmail]);

  const handleSelect = (owner: Profile) => {
    setQuery(owner.email);
    setResults([]);
    setShowResults(false);
    onOwnerSelect(owner.id, owner.email);
  };

  return (
    <div className="relative">
      <Input
        placeholder="Search for owner by email..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        onFocus={() => setShowResults(true)}
      />
      {showResults && (query.length > 0 || results.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {isLoading && (
            <div className="p-2 text-sm text-gray-500">Searching...</div>
          )}
          {!isLoading && results.length > 0 && (
            <ul>
              {results.map((owner) => (
                <li
                  key={owner.id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onMouseDown={() => handleSelect(owner)}
                >
                  <p className="font-semibold">{owner.fullName}</p>
                  <p className="text-sm text-gray-600">{owner.email}</p>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && results.length === 0 && query.length > 1 && (
            <div className="p-2 text-sm text-gray-500">No owners found.</div>
          )}
        </div>
      )}
    </div>
  );
}
