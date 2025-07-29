import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { ScopeRole, Scope, UserRole, MediaEntityType } from 'src/common/types';
import { MediaService } from './media.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Profile } from '@sportefy/db-types';
import { Public } from 'src/common/decorators/public.decorator';
import { ParseScopePipe } from 'src/common/pipes/parse-scope.pipe';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiScope } from 'src/common/decorators/scope.decorator';
import { CreateMediaDto } from './dto/create-media.dto';

@ApiTags('Location Media')
@Controller(':scope/:scopeId/media')
@ApiParam({
  name: 'scope',
  enum: Scope,
  description: 'The scope type (facility or venue)',
})
@ApiParam({
  name: 'scopeId',
  type: String,
  description: 'ID of the facility or venue',
})
export class mediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get media for a facility or venue' })
  @ApiResponse({ status: 200, description: 'Returns a list of media items.' })
  getMedia(
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe)
    scope: MediaEntityType.FACILITY | MediaEntityType.VENUE,
  ) {
    return this.mediaService.getMedia(scope, scopeId);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Post()
  @ApiOperation({ summary: 'Add a single media item' })
  @ApiBody({ type: CreateMediaDto, required: true })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR])
  async addMedia(
    @CurrentUser() user: Profile,
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe)
    scope: MediaEntityType.FACILITY | MediaEntityType.VENUE,
    @Body() body: CreateMediaDto,
  ) {
    return this.mediaService.createMedia(scopeId, scope, [body]);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Post('bulk')
  @ApiOperation({ summary: 'Add multiple media items' })
  @ApiBody({ type: [CreateMediaDto], required: true })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR])
  async addMediaBulk(
    @CurrentUser() user: Profile,
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe)
    scope: MediaEntityType.FACILITY | MediaEntityType.VENUE,
    @Body() body: CreateMediaDto[],
  ) {
    return this.mediaService.createMedia(scopeId, scope, body);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Delete(':mediaId')
  @ApiOperation({ summary: 'Delete a specific media item' })
  @ApiParam({
    name: 'mediaId',
    type: String,
    description: 'ID of the media item',
  })
  @ApiResponse({ status: 200, description: 'Media item deleted successfully.' })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR])
  async deleteMedia(
    @CurrentUser() user: Profile,
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe)
    scope: MediaEntityType.FACILITY | MediaEntityType.VENUE,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.deleteMedia(scope, scopeId, mediaId);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Delete()
  @ApiOperation({ summary: 'Delete all media for a location' })
  @ApiResponse({
    status: 200,
    description: 'Media items deleted successfully.',
  })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR])
  async deleteAllmedia(
    @CurrentUser() user: Profile,
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe)
    scope: MediaEntityType.FACILITY | MediaEntityType.VENUE,
  ) {
    return this.mediaService.deleteMedia(scope, scopeId);
  }
}
