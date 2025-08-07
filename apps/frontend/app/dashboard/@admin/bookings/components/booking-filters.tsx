"use client";

import React, { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchVenuesByName } from '@/lib/actions/venue-actions';
import { useDebounce } from '@/hooks/use-debounce';
import { Venue } from '@sportefy/db-types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BookingFilters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debouncedQuery = useDebounce(query, 500);

    const venueId = searchParams.get('venueId');
    const status = searchParams.get('status');

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 1) return setResults([]);
        setIsLoading(true);
        const response = await searchVenuesByName(searchQuery);
        setResults(response || []);
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        handleSearch(debouncedQuery);
    }, [debouncedQuery, handleSearch]);

    const handleFilterChange = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page');
        router.push(`?${params.toString()}`);
    };
    
    const handleSelectVenue = (venue: Venue) => {
        setQuery(venue.name ?? '');
        setShowResults(false);
        handleFilterChange('venueId', venue.id);
    };

    const clearVenueFilter = () => {
        setQuery('');
        handleFilterChange('venueId', null);
    };
    
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative w-full md:w-1/3">
                <Input
                    placeholder="Filter by venue name..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
                {venueId && (
                    <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-7" onClick={clearVenueFilter}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
                {showResults && query.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                         {isLoading && <div className="p-2 text-sm text-muted-foreground">Searching...</div>}
                         {results.length > 0 && (
                             <ul>{results.map(venue => (
                                 <li key={venue.id} className="p-2 cursor-pointer hover:bg-accent" onMouseDown={() => handleSelectVenue(venue)}>
                                     {venue.name}
                                 </li>
                             ))}</ul>
                         )}
                    </div>
                )}
            </div>
            <Select onValueChange={(value) => handleFilterChange('status', value)} value={status || ''}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}