import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ScopeRole, Scope, UserRole } from 'src/common/types';
import { CreateOperatingHourDto } from './dto/create-operating-hour.dto';
import { OperatingHourService } from './operating-hour.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Profile } from '@sportefy/db-types';
import { Public } from 'src/common/decorators/public.decorator';
import { ParseScopePipe } from 'src/common/pipes/parse-scope.pipe';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiScope } from 'src/common/decorators/scope.decorator';

@ApiTags('Operating Hour')
@Controller(':scope/:scopeId/operating-hours')
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
export class OperatingHourController {
  constructor(private readonly operatingHourService: OperatingHourService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get operating hours for a facility or venue' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of operating hours.',
  })
  getOperatingHours(
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe) scope: Scope,
  ) {
    return this.operatingHourService.getOperatingHours(scopeId, scope);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Post()
  @ApiOperation({ summary: 'Add a single operating hour' })
  @ApiBody({ type: CreateOperatingHourDto, required: true })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR])
  async addOperatingHour(
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe) scope: Scope,
    @Body() body: CreateOperatingHourDto,
  ) {
    return this.operatingHourService.addOperatingHour(scopeId, scope, body);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Post('bulk')
  @ApiOperation({ summary: 'Add multiple operating hours' })
  @ApiBody({ type: [CreateOperatingHourDto], required: true })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR])
  async addOperatingHours(
    @CurrentUser() user: Profile,
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe) scope: Scope,
    @Body() body: CreateOperatingHourDto[],
  ) {
    return this.operatingHourService.addOperatingHours(scopeId, scope, body);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Patch(':hourId')
  @ApiOperation({ summary: 'Update an operating hour' })
  @ApiParam({
    name: 'hourId',
    type: Number,
    description: 'ID of the operating hour',
  })
  @ApiBody({ type: CreateOperatingHourDto, required: true })
  @ApiResponse({
    status: 200,
    description: 'Operating hour updated successfully.',
  })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR])
  async updateOperatingHour(
    @CurrentUser() user: Profile,
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe) scope: Scope,
    @Param('hourId') hourId: number,
    @Body() body: CreateOperatingHourDto,
  ) {
    return this.operatingHourService.updateOperatingHour(
      scopeId,
      scope,
      hourId,
      body,
    );
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Delete(':hourId')
  @ApiOperation({ summary: 'Delete an operating hour' })
  @ApiParam({
    name: 'hourId',
    type: Number,
    description: 'ID of the operating hour',
  })
  @ApiResponse({
    status: 200,
    description: 'Operating hour deleted successfully.',
  })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR])
  async deleteOperatingHour(
    @CurrentUser() user: Profile,
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe) scope: Scope,
    @Param('hourId') hourId: number,
  ) {
    return this.operatingHourService.deleteOperatingHour(
      scopeId,
      scope,
      hourId,
    );
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Delete()
  @ApiOperation({ summary: 'Delete all operating hours for a scope' })
  @ApiResponse({
    status: 200,
    description: 'Operating hours deleted successfully.',
  })
  @ApiScope([ScopeRole.OWNER, ScopeRole.MODERATOR])
  async deleteOperatingHours(
    @Param('scopeId') scopeId: string,
    @Param('scope', ParseScopePipe) scope: Scope,
  ) {
    return this.operatingHourService.deleteOperatingHours(scopeId, scope);
  }
}
