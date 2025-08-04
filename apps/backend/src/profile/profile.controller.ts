import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Profile, User } from '@sportefy/db-types';
import { UserRole } from 'src/common/types';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiBody } from '@nestjs/swagger';
import { ResponseBuilder } from 'src/common/utils/response-builder';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Get('me')
  async getProfile(@CurrentUser() user: Profile) {
    return ResponseBuilder.success(user);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @Get('me-with-scopes')
  async getProfileWithScopes(@CurrentUser() user: Profile) {
    return this.profileService.getProfileWithScopes(user.id);
  }

  @Auth(UserRole.ADMIN, UserRole.USER)
  @ApiBody({
    type: UpdateProfileDto,
    required: true,
    description: 'Update user profile data',
  })
  @Patch()
  async updateProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.id, body);
  }
}
