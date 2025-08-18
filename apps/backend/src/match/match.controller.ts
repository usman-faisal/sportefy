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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { MatchService } from './match.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Profile } from '@sportefy/db-types';
import { UserRole } from 'src/common/types';
import { UpdateMatchDto } from './dto/update-match.dto';
import { FilterMatchesDto } from './dto/filter-match.dto';
import { GetMatchesDto } from './dto/get-matches.dto';

@ApiTags('Matches')
@Controller('matches')
@Auth(UserRole.USER, UserRole.ADMIN)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get match details' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async getMatchDetails(
    @Param('id') matchId: string,
    @CurrentUser() user: Profile,
  ) {
    return this.matchService.getMatchDetails(user, matchId);
  }

  @Get('user/my-matches')
  @ApiOperation({ summary: 'Get user matches' })
  @ApiResponse({ status: 200, description: 'User matches retrieved successfully' })
  async getUserMatches(
    @CurrentUser() user: Profile,
    @Query() getMatchesDto: GetMatchesDto,
  ) {
    return this.matchService.getUserMatches(user, getMatchesDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update match details' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match updated successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the match owner' })
  async updateMatch(
    @Param('id') matchId: string,
    @CurrentUser() user: Profile,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    return this.matchService.updateMatch(matchId, user, updateMatchDto);
  }

  @Post(':id/join')
  @ApiOperation({ 
    summary: 'Join a match',
    description: 'For public matches, creates a join request. For private matches, use the match code endpoint instead.'
  })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        team: { type: 'string', enum: ['A', 'B'], description: 'Preferred team (optional)' },
        message: { type: 'string', description: 'Optional message for join request' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Join request created successfully (for public matches)' })
  @ApiResponse({ status: 403, description: 'Cannot directly join private match' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async joinMatch(
    @Param('id') matchId: string,
    @CurrentUser() user: Profile,
    @Body() body: { team?: 'A' | 'B', message?: string } = {},
  ) {
    return this.matchService.joinMatch(matchId, user, body.team, body.message);
  }

  @Post('join-with-code')
  @ApiOperation({ 
    summary: 'Join a private match using match code',
    description: 'Use this endpoint to join private matches by providing the 6-character match code'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        matchCode: { 
          type: 'string', 
          description: 'The 6-character match code (e.g., "ABC123" or "ABC-123")',
          example: 'ABC123'
        }
      },
      required: ['matchCode']
    }
  })
  @ApiResponse({ status: 201, description: 'Successfully joined the match' })
  @ApiResponse({ status: 400, description: 'Invalid match code or insufficient credits' })
  @ApiResponse({ status: 404, description: 'Match not found with this code' })
  @ApiResponse({ status: 403, description: 'Match is not open or user cannot join' })
  async joinMatchWithCode(
    @CurrentUser() user: Profile,
    @Body() body: { matchCode: string },
  ) {
    return this.matchService.joinMatchUsingCode(user, body.matchCode);
  }

  @Post(':id/regenerate-code')
  @ApiOperation({ 
    summary: 'Regenerate match code',
    description: 'Generate a new match code for a private match. Only the match creator can do this.'
  })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match code regenerated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the match owner' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async regenerateMatchCode(
    @Param('id') matchId: string,
    @CurrentUser() user: Profile,
  ) {
    return this.matchService.regenerateMatchCode(user, matchId);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Successfully left the match' })
  @ApiResponse({ status: 403, description: 'Cannot leave - you are the match owner' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async leaveMatch(
    @Param('id') matchId: string,
    @CurrentUser() user: Profile,
  ) {
    return this.matchService.leaveMatch(user, matchId);
  }

  @Delete(':matchId/kick/:userId')
  @ApiOperation({ summary: 'Kick a player from match' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiParam({ name: 'userId', description: 'User ID to kick' })
  @ApiResponse({ status: 200, description: 'User kicked successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the match owner' })
  @ApiResponse({ status: 404, description: 'Match or user not found' })
  async kickPlayer(
    @Param('matchId') matchId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: Profile,
  ) {
    return this.matchService.kickPlayer(matchId, userId, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get filtered matches' })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  async getFilteredMatches(@Query() filters: FilterMatchesDto) {
    return this.matchService.getFilteredMatches(filters);
  }
}