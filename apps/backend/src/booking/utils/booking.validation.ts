import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Booking, Match, Profile, Venue } from '@sportefy/db-types';
import { UserRole } from 'src/common/types';

export const assertUserOwnsTheBooking = (user: Profile, booking: Booking) => {
  if (user.id !== booking.bookedBy && user.role !== UserRole.ADMIN) {
    throw new ForbiddenException('You do not own the booking');
  }
};

export const assertUserHasEnoughCredits = (user: Profile, amount: number) => {
  if (!user.credits || user.credits <= amount) {
    throw new BadRequestException('Not enough credits');
  }
};

export const assertPlayerLimitIsLessThanCapacity = (
  venue: Venue,
  playerLimit: number,
) => {
  if (playerLimit > venue.capacity) {
    throw new BadRequestException('Player limit exceeds capacity');
  }
};

export const assertUserDoesntOwnTheBooking = (
  user: Profile,
  booking: Booking,
) => {
  if (user.id === booking.bookedBy) {
    throw new ForbiddenException('You own the booking');
  }
};

export const assertBookingStatusIsNot = (
  booking: Booking,
  status: 'cancelled' | 'confirmed' | 'completed' | 'pending',
  message?: string,
) => {
  if (booking.status === status) {
    throw new BadRequestException(message || `Booking is already ${status}.`);
  }
};

export const assertBookingStatusIs = (
  booking: Booking,
  status: 'cancelled' | 'confirmed' | 'completed' | 'pending',
  message?: string,
) => {
  if (booking.status !== status) {
    throw new BadRequestException(message || `Booking is not ${status}.`);
  }
};

export const assertBookingIsWithin2Hours = (booking: Booking) => {
  const CANCELLATION_WINDOW_MS = 2 * 60 * 60 * 1000;

  const currentTimeMs = new Date().getTime();

  if (!booking.createdAt) {
    throw new Error('Booking creation time is missing.');
  }

  const bookingCreationTimeMs = booking.createdAt.getTime();

  const timeDifference = currentTimeMs - bookingCreationTimeMs;

  if (timeDifference > CANCELLATION_WINDOW_MS) {
    throw new BadRequestException(
      'Booking can only be canceled within 2 hours of creation.',
    );
  }
};

export const assertMatchStatusIs = (
  match: Match,
  status: 'full' | 'open' | 'cancelled' | 'completed',
  message?: string,
) => {
  if (match.status !== status) {
    throw new BadRequestException(message || `Match is not ${status}.`);
  }
};

export const validateCancellableBooking = (
  booking: Booking & { match: Match },
  user: Profile,
) => {
  assertUserOwnsTheBooking(user, booking);
  assertBookingStatusIs(booking, 'pending');
  assertBookingIsWithin2Hours(booking);
};

export const validateConfirmableBooking = (
  booking: Booking & { match: Match },
  user: Profile,
) => {
  assertUserOwnsTheBooking(user, booking);
  assertBookingStatusIs(booking, 'pending');
  assertMatchStatusIs(booking.match, 'full');
};
