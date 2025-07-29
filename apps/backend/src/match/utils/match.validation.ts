// src/match/utils/match.validation.ts

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GenderPreferenceEnum } from 'src/common/types';
import { Booking, Match, MatchPlayer, Profile } from '@sportefy/db-types';

// =================================================================
// Core Assertion Functions (Single Checks)
// =================================================================

export const assertMatchExists = (
  match: Match | undefined | null,
): asserts match is Match => {
  if (!match) {
    throw new NotFoundException('Match not found.');
  }
};

export const assertBookingExists = (
  booking: Booking | undefined | null,
): asserts booking is Booking => {
  if (!booking) {
    // This would likely indicate an internal data integrity issue.
    throw new NotFoundException('Associated booking for this match not found.');
  }
};

export const assertMatchIsOpen = (match: Match) => {
  if (match.status !== 'open') {
    throw new ForbiddenException('Match is not open for new players.');
  }
};

export const assertBookingIsNotCancelled = (booking: Booking) => {
  if (booking.status === 'cancelled') {
    throw new ForbiddenException('Cannot interact with a cancelled match.');
  }
};

export const assertUserCanUpdateMatch = (booking: Booking, user: Profile) => {
  if (booking.bookedBy !== user.id) {
    throw new ForbiddenException(
      'You do not have permission to update this match.',
    );
  }
};

export const assertUserIsNotAlreadyInMatch = (
  matchPlayers: MatchPlayer[],
  user: Profile,
) => {
  const isPlayer = matchPlayers.some((player) => player.userId === user.id);
  if (isPlayer) {
    throw new BadRequestException('You are already in this match.');
  }
};

export const assertTeamIsNotFull = (
  matchPlayers: MatchPlayer[],
  team: 'A' | 'B',
  playerLimit: number,
) => {
  const teamPlayerCount = matchPlayers.filter(
    (player) => player.team === team,
  ).length;
  if (teamPlayerCount >= playerLimit / 2) {
    throw new ForbiddenException(`Team ${team} is already full.`);
  }
};

export const assertMatchIsNotFull = (
  matchPlayers: MatchPlayer[],
  playerLimit: number,
) => {
  if (matchPlayers.length >= playerLimit) {
    throw new ForbiddenException('This match is already full.');
  }
};

export const assertUserHasEnoughCredits = (
  user: Profile,
  creditsToCharge: number,
) => {
  if (!user.credits || user.credits < creditsToCharge) {
    throw new BadRequestException('You do not have enough credits to join.');
  }
};

export const assertUserIsInMatchPlayers = (
  matchPlayers: MatchPlayer[],
  userIdToCheck: string,
) => {
  if (!matchPlayers.some((player) => player.userId === userIdToCheck)) {
    throw new BadRequestException('User is not a player of this match');
  }
};

export const assertUserMeetsMatchCriteria = (match: Match, user: Profile) => {
  // Gender preference check
  if (
    match.genderPreference !== GenderPreferenceEnum.ANY &&
    user.gender !== match.genderPreference.split('_')[0]
  ) {
    throw new ForbiddenException(
      `This match is for ${match.genderPreference.replace(
        '_',
        ' ',
      )} players only.`,
    );
  }

  // Age requirements check
  if (user.age) {
    if (match.minAge && user.age < match.minAge) {
      throw new ForbiddenException(
        `You must be at least ${match.minAge} years old to join.`,
      );
    }
    if (match.maxAge && user.age > match.maxAge) {
      throw new ForbiddenException(
        `You must be no older than ${match.maxAge} to join.`,
      );
    }
  }
};

// =================================================================
// Composite Validator Functions (Grouped Checks for Use Cases)
// =================================================================

export const validateUserCanViewPrivateMatch = (
  match: Match,
  matchPlayers: MatchPlayer[],
  user: Profile,
) => {
  if (match.matchType === 'private') {
    const isPlayer = matchPlayers.some((player) => player.userId === user.id);
    if (!isPlayer) {
      throw new ForbiddenException(
        'This is a private match. You do not have access.',
      );
    }
  }
};

export const validateUserCanJoinPublicMatch = (
  match: Match,
  booking: Booking,
  matchPlayers: MatchPlayer[],
  user: Profile,
  team: 'A' | 'B',
) => {
  assertMatchIsOpen(match);
  assertBookingIsNotCancelled(booking);
  assertUserIsNotAlreadyInMatch(matchPlayers, user);
  assertTeamIsNotFull(matchPlayers, team, match.playerLimit);
  assertUserMeetsMatchCriteria(match, user);
};

export const validateUserCanJoinByInvite = (
  match: Match,
  booking: Booking,
  matchPlayers: MatchPlayer[],
  user: Profile,
) => {
  assertMatchIsOpen(match);
  assertBookingIsNotCancelled(booking);
  assertUserIsNotAlreadyInMatch(matchPlayers, user);
  assertMatchIsNotFull(matchPlayers, match.playerLimit);
};

// =================================================================
// Utility Functions (Not Validators)
// =================================================================

/**
 * Determines which team a new player should join to keep teams balanced.
 */
export function findTeamToJoin(matchPlayers: MatchPlayer[]): 'A' | 'B' {
  const teamAPlayers = matchPlayers.filter(
    (player) => player.team === 'A',
  ).length;
  const teamBPlayers = matchPlayers.filter(
    (player) => player.team === 'B',
  ).length;
  return teamAPlayers <= teamBPlayers ? 'A' : 'B';
}

/**
 * Checks if the match will be full after adding one more player.
 */
export function isMatchNowFull(
  matchPlayers: MatchPlayer[],
  playerLimit: number,
) {
  return matchPlayers.length + 1 >= playerLimit;
}

export function isMatchFull(matchPlayers: MatchPlayer[], playerLimit: number) {
  return matchPlayers.length >= playerLimit;
}
