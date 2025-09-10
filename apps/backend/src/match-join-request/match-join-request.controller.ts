import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { ReviewJoinRequestDto } from './dto/review-join-request.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Profile } from '@sportefy/db-types';
import { UserRole } from 'src/common/types';
import { MatchJoinRequestService } from './match-join-request.service';

@ApiTags('Match Join Requests')
@Controller()
@Auth(UserRole.USER, UserRole.ADMIN)
export class MatchJoinRequestController {
  constructor(private readonly matchJoinRequestService: MatchJoinRequestService) {}

  @Post('join-request/:matchId')
  @ApiOperation({ summary: 'Create a join request for a match' })
  @ApiResponse({ status: 201, description: 'Join request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async createJoinRequest(
    @Param('matchId') matchId: string,
    @CurrentUser() user: Profile,
    @Body() createJoinRequestDto: CreateJoinRequestDto,
  ) {
    return this.matchJoinRequestService.createJoinRequest(
      matchId,
      user,
      createJoinRequestDto,
    );
  }

  @Put('join-request/:requestId/review')
  @ApiOperation({ summary: 'Approve or reject a join request' })
  @ApiResponse({ status: 200, description: 'Join request reviewed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the match owner' })
  @ApiResponse({ status: 404, description: 'Join request not found' })
  async reviewJoinRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() user: Profile,
    @Body() reviewDto: ReviewJoinRequestDto,
  ) {
    return this.matchJoinRequestService.reviewJoinRequest(requestId, user, reviewDto);
  }

  @Get('join-request/match/:matchId')
  @ApiOperation({ summary: 'Get join requests for a match (match owner only)' })
  @ApiResponse({ status: 200, description: 'Join requests retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the match owner' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async getMatchJoinRequests(
    @Param('matchId') matchId: string,
    @CurrentUser() user: Profile,
  ) {
    return this.matchJoinRequestService.getMatchJoinRequests(matchId, user);
  }

  @Get('join-request/my-requests')
  @ApiOperation({ summary: 'Get current user join requests' })
  @ApiResponse({ status: 200, description: 'User join requests retrieved successfully' })
  async getUserJoinRequests(
    @CurrentUser() user: Profile,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.matchJoinRequestService.getUserJoinRequests(user, limit, offset);
  }

  @Get('join-request/pending-for-my-matches')
  @ApiOperation({ summary: 'Get pending join requests for matches owned by current user' })
  @ApiResponse({ status: 200, description: 'Pending join requests for user-owned matches retrieved successfully' })
  async getPendingRequestsForUserOwnedMatches(
    @CurrentUser() user: Profile,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.matchJoinRequestService.getPendingRequestsForUserOwnedMatches(user, limit, offset);
  }

  @Delete('join-request/:requestId')
  @ApiOperation({ summary: 'Cancel a join request' })
  @ApiResponse({ status: 200, description: 'Join request cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - cannot cancel' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your request' })
  @ApiResponse({ status: 404, description: 'Join request not found' })
  async cancelJoinRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() user: Profile,
  ) {
    return this.matchJoinRequestService.cancelJoinRequest(requestId, user);
  }
}
