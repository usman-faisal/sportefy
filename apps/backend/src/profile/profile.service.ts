import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileRepository } from './profile.repository';
import { eq } from 'drizzle-orm';
import { profiles } from '@sportefy/db-types';
import { ResponseBuilder } from 'src/common/utils/response-builder';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleClient,
    private readonly profileRepository: ProfileRepository,
  ) {}

  // async getProfile(id: string) {
  //         const profile = await this.profileRepository.getProfileById(id);

  //         if (!profile) {
  //             throw new NotFoundException('Profile not found')
  //         }

  //         this.logger.log(`Successfully retrieved profile ID: ${id}`);
  //         return profile
  // }

  async getProfileWithScopes(id: string) {
    const profile = await this.profileRepository.getProfile(
      eq(profiles.id, id),
      { userScopes: { with: { venue: true, facility: true } } },
    );

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return ResponseBuilder.success(profile, 'Profile retrieved successfully');
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const updatedProfile = await this.profileRepository.updateProfileById(id, {
      ...updateProfileDto,
      updatedAt: new Date(),
    });

    if (!updatedProfile) {
      throw new NotFoundException('Profile not found');
    }

    this.logger.log(`Successfully updated profile ID: ${id}`);
    return updatedProfile;
  }
}
