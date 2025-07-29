import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/types';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Profile } from '@sportefy/db-types';
import { UpdateMatchDto, UpdateMatchDtoSwagger } from './dto/update-match.dto';
import { FilterMatchesDto } from './dto/filter-match.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { GetMatchesDto } from './dto/get-matches.dto';

@ApiTags('matches')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Public()
  @ApiOperation({ summary: 'Filter and retrieve public matches' })
  @ApiExtraModels(FilterMatchesDto)
  @Get('filter')
  async getFilteredMatches(@Query() filters: FilterMatchesDto) {
    return this.matchService.getFilteredMatches(filters);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get matches for the current user' })
  @Get()
  async getUserMatches(
    @CurrentUser() user: Profile,
    @Query() getMatchesDto: GetMatchesDto,
  ) {
    return this.matchService.getUserMatches(user, getMatchesDto);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get details for a specific match' })
  @Get(':matchId')
  @ApiParam({
    name: 'matchId',
    type: String,
    description: 'The ID of the match to retrieve',
  })
  async getMatchDetails(
    @CurrentUser() user: Profile,
    @Param('matchId') matchId: string,
  ) {
    return this.matchService.getMatchDetails(user, matchId);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update match details' })
  @Patch(':matchId')
  @ApiParam({
    name: 'matchId',
    type: String,
    description: 'The ID of the match to update',
  })
  @ApiBody({ type: UpdateMatchDtoSwagger })
  async updateMatch(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @CurrentUser() user: Profile,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    return this.matchService.updateMatch(matchId, user, updateMatchDto);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Join a match using match ID or invite token' })
  @Post(':matchId/join')
  @ApiParam({
    name: 'matchId',
    type: String,
    description: 'The ID of the match to join',
  })
  @ApiQuery({
    name: 'team',
    required: false,
    enum: ['A', 'B'],
    description:
      'The team to join (A or B). Not required if using an invite token.',
  })
  @ApiQuery({
    name: 'inviteToken',
    required: false,
    type: String,
    description:
      'An invite token for a private match. If provided, the team parameter is ignored.',
  })
  async joinMatch(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @CurrentUser() user: Profile,
    @Query('team') team?: 'A' | 'B',
    @Query('inviteToken') inviteToken?: string,
  ) {
    if (inviteToken) {
      return this.matchService.joinMatchUsingInviteToken(user, inviteToken);
    }

    if (!team) {
      throw new BadRequestException(
        'A team must be provided to join a public match.',
      );
    }

    return this.matchService.joinMatch(matchId, user, team);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: 'Leave a match',
    description:
      'Allows an authenticated user to leave a match they have previously joined. The user cannot be the original creator of the booking.',
  })
  @ApiParam({
    name: 'matchId',
    type: String,
    description: 'The ID of the match to leave',
  })
  @ApiResponse({ status: 200, description: 'Successfully left the match.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. The user owns the booking and cannot leave, or the match is not in a valid state to be left.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found. The match does not exist.',
  })
  @Delete(':matchId/leave')
  async leaveMatch(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @CurrentUser() user: Profile,
  ) {
    return this.matchService.leaveMatch(user, matchId);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: 'Kick a player from a match',
    description:
      'Allows the user who created the booking to kick another player from the match.',
  })
  @ApiParam({
    name: 'matchId',
    type: String,
    description: 'The ID of the match.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'The ID of the user to be kicked from the match.',
  })
  @ApiResponse({
    status: 200,
    description: 'Player successfully kicked from the match.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. The requesting user is not the creator of the booking.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found. The match or the user to be kicked does not exist.',
  })
  @Delete(':matchId/kick/:userId')
  async kickPlayer(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Param('userId', ParseUUIDPipe) userIdToKick: string,
    @CurrentUser() user: Profile,
  ) {
    return this.matchService.kickPlayer(matchId, userIdToKick, user);
  }
}
