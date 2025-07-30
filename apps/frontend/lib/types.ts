import { Profile, Venue } from "@sportefy/db-types";
import { OperatingHour } from "@sportefy/db-types";
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum Scope {
  FACILITY = "facility",
  VENUE = "venue",
}

export enum ScopeRole {
  MODERATOR = "moderator",
  OWNER = "owner",
}

export enum Availability {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
}

export enum MatchType {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum Space {
  INDOOR = "indoor",
  OUTDOOR = "outdoor",
}

export enum GenderEnum {
  MALE = "male",
  FEMALE = "female",
}

export enum MediaEntityType {
  FACILITY = "facility",
  VENUE = "venue",
  PAYMENT = "payment",
  REVIEW = "review",
}

export enum SlotEventType {
  BOOKING = "booking",
  MAINTENANCE = "maintenance",
}

export enum PaymentSplitType {
  CREATOR_PAYS_ALL = "creator_pays_all",
  SPLIT_EVENLY = "split_evenly",
}

export enum MediaEnum {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum MatchStatus {
  OPEN = "open",
  FULL = "full",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type VenueWithOperatingHours = Venue & {
  operatingHours: OperatingHour[];
};

export enum DayOfWeek {
  SUNDAY = "Sunday",
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
}

export enum SportType {
  SINGLE = "single",
  MULTIPLE = "multiple",
}

export type AuthenticatedRequest = Request & {
  user: Profile;
};

// MATCH

export enum SkillLevel {
  ANY = "any",
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum GenderPreferenceEnum {
  ANY = "any",
  MALE_ONLY = "male_only",
  FEMALE_ONLY = "female_only",
}

export interface MatchPreference {
  skillLevel: SkillLevel;
  minAge: number;
  maxAge: number;
  organizationPreference: string;
  genderPreference: GenderPreferenceEnum;
}

export type EffectiveRole = ScopeRole | UserRole.USER;
