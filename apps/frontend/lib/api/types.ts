import { UserScope, Venue } from "@sportefy/db-types";

export interface UserScopeWithVenue extends UserScope {
  venue: Venue;
}
