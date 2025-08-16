import { VenueDetails } from "@/lib/api/types";

/**
 * Determines if a venue is a gym based on its sports configuration.
 * A gym is defined as a venue that:
 * 1. Has exactly one sport
 * 2. That sport is not time-bound (timeBound = false)
 * 3. That sport is of type 'single'
 */
export function isGym(venue: VenueDetails): boolean {
  if (!venue.sports || venue.sports.length !== 1) {
    return false;
  }

  const sport = venue.sports[0];
  return !sport.timeBound && sport.sportType === 'single';
}