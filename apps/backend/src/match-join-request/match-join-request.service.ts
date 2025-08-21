import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchJoinRequestRepository } from './match-join-request.repository';
import { MatchPlayerRepository } from '../match-player/match-player.repository';
import { MatchRepository } from 'src/match/match.repository';
import { ProfileRepository } from 'src/profile/profile.repository';
import { CreditService } from 'src/credit/credit.service';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { ReviewJoinRequestDto } from './dto/review-join-request.dto';
import { Profile, matches, matchJoinRequests } from '@sportefy/db-types';
import { eq, and } from 'drizzle-orm';
import { MatchType, PaymentSplitType } from 'src/common/types';
import * as matchValidator from 'src/match/utils/match.validation';
import {
  assertUserOwnsTheBooking,
  assertBookingStatusIs,
} from 'src/booking/utils/booking.validation';
import { BookingRepository } from 'src/booking/booking.repository';

@Injectable()
export class MatchJoinRequestService {
  constructor(
    private readonly matchJoinRequestRepository: MatchJoinRequestRepository,
    private readonly matchPlayerRepository: MatchPlayerRepository,
    private readonly matchRepository: MatchRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly creditService: CreditService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async createJoinRequest(
    matchId: string,
    user: Profile,
    createJoinRequestDto: CreateJoinRequestDto,
  ) {
    const match = await this.matchRepository.getMatchById(matchId, {
      booking: true,
      matchPlayers: true,
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (!match.booking) {
      throw new NotFoundException('Match booking not found');
    }

    // Validate the match is open and public
    if (match.status !== 'open') {
      throw new ForbiddenException('Match is not open for requests');
    }

    if (match.matchType !== MatchType.PUBLIC) {
      throw new ForbiddenException('Can only request to join public matches');
    }

    assertBookingStatusIs(match.booking, 'pending');

    // Check if user already has a pending request
    const existingRequest =
      await this.matchJoinRequestRepository.getUserPendingRequestForMatch(
        matchId,
        user.id,
      );

    if (existingRequest) {
      throw new BadRequestException(
        'You already have a pending request for this match',
      );
    }

    // Check if user is already in the match
    const existingPlayer = await this.matchPlayerRepository.getMatchPlayerByIds(
      matchId,
      user.id,
    );

    if (existingPlayer) {
      throw new BadRequestException('You are already part of this match');
    }

    // Validate user meets match criteria (if team is specified)
    if (createJoinRequestDto.preferredTeam) {
      matchValidator.validateUserCanJoinPublicMatch(
        match,
        match.booking,
        match.matchPlayers,
        user,
        createJoinRequestDto.preferredTeam,
      );
    }

    // Create the join request
    const joinRequest =
      await this.matchJoinRequestRepository.createMatchJoinRequest({
        matchId,
        requesterId: user.id,
        preferredTeam: createJoinRequestDto.preferredTeam,
        message: createJoinRequestDto.message,
      });

    return ResponseBuilder.created(
      joinRequest,
      'Join request created successfully',
    );
  }

  async reviewJoinRequest(
    requestId: string,
    user: Profile,
    reviewDto: ReviewJoinRequestDto,
  ) {
    const joinRequest =
      await this.matchJoinRequestRepository.getMatchJoinRequestById(requestId);

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== 'pending') {
      throw new BadRequestException('Join request has already been reviewed');
    }

    // Get the match with its relations
    const match = await this.matchRepository.getMatchById(joinRequest.matchId, {
      booking: true,
      matchPlayers: true,
    });

    if (!match || !match.booking) {
      throw new NotFoundException('Match or booking not found');
    }

    // Only the booking owner can review requests
    assertUserOwnsTheBooking(user, match.booking);

    // Get requester profile
    const requesterProfile = await this.profileRepository.getProfileById(
      joinRequest.requesterId,
    );

    if (!requesterProfile) {
      throw new NotFoundException('Requester profile not found');
    }

    const result = await this.unitOfWork.do(async (tx) => {
      // Update the request status
      const [updatedRequest] =
        await this.matchJoinRequestRepository.updateMatchJoinRequestById(
          requestId,
          {
            status: reviewDto.decision,
            reviewedBy: user.id,
            reviewedAt: new Date(),
          },
          tx,
        );

      if (reviewDto.decision === 'approved') {
        // If approved, add the user to the match
        const creditsToCharge = this.creditService.calculatePerPlayerCharge(
          match.matchType as MatchType,
          match.paymentSplitType as PaymentSplitType,
          match.booking.totalCredits,
          match.playerLimit,
          false,
        );

        // Check if requester has enough credits
        if (
          !requesterProfile.credits ||
          requesterProfile.credits < creditsToCharge
        ) {
          throw new BadRequestException(
            'Requester does not have enough credits to join this match',
          );
        }

        // Determine team assignment
        const assignedTeam =
          reviewDto.assignedTeam ||
          joinRequest.preferredTeam ||
          matchValidator.findTeamToJoin(match.matchPlayers);

        // Create match player
        const newMatchPlayer =
          await this.matchPlayerRepository.createMatchPlayer(
            {
              matchId: joinRequest.matchId,
              userId: joinRequest.requesterId,
              team: assignedTeam,
            },
            tx,
          );

        // Charge credits
        if (creditsToCharge > 0) {
          await this.profileRepository.updateProfileCreditsById(
            joinRequest.requesterId,
            -creditsToCharge,
            tx,
          );
        }

        // Check if match is now full
        const updatedMatchPlayers = [...match.matchPlayers, newMatchPlayer];
        if (
          matchValidator.isMatchNowFull(updatedMatchPlayers, match.playerLimit)
        ) {
          await this.matchRepository.updateMatchById(
            joinRequest.matchId,
            { status: 'full' },
            tx,
          );
        }

        return { updatedRequest, newMatchPlayer };
      }

      return { updatedRequest };
    });

    const message =
      reviewDto.decision === 'approved'
        ? 'Join request approved and user added to match'
        : 'Join request rejected';

    return ResponseBuilder.success(result, message);
  }

  async getMatchJoinRequests(matchId: string, user: Profile) {
    const match = await this.matchRepository.getMatchById(matchId, {
      booking: true,
    });

    if (!match || !match.booking) {
      throw new NotFoundException('Match not found');
    }

    // Only booking owner can view join requests
    assertUserOwnsTheBooking(user, match.booking);

    const requests =
      await this.matchJoinRequestRepository.getRequestsByMatch(matchId);

    return ResponseBuilder.success(
      requests,
      'Join requests retrieved successfully',
    );
  }

  async getUserJoinRequests(user: Profile, limit?: number, offset?: number) {
    const requests = await this.matchJoinRequestRepository.getRequestsByUser(
      user.id,
      undefined,
      limit,
      offset,
    );

    return ResponseBuilder.success(
      requests,
      'User join requests retrieved successfully',
    );
  }

  async cancelJoinRequest(requestId: string, user: Profile) {
    const joinRequest =
      await this.matchJoinRequestRepository.getMatchJoinRequestById(requestId);

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.requesterId !== user.id) {
      throw new ForbiddenException(
        'You can only cancel your own join requests',
      );
    }

    if (joinRequest.status !== 'pending') {
      throw new BadRequestException('Can only cancel pending join requests');
    }

    await this.matchJoinRequestRepository.deleteMatchJoinRequestById(requestId);

    return ResponseBuilder.deleted('Join request cancelled successfully');
  }
}
