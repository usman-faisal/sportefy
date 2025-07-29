import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from 'src/profile/profile.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { SearchUsersDto } from './dto/search-users.dto';

@Injectable()
export class UserService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  /**
   * Get a paginated list of users with search functionality.
   */
  async getAllUsers(searchQuery: SearchUsersDto) {
    const { search, limit = 10, page = 10 } = searchQuery;
    const offset = (page - 1) * limit;

    const { users, total } = await this.profileRepository.findAndCount({
      search,
      limit,
      offset,
    });

    const hasNext = total > offset + limit;
    const hasPrev = offset > 0;
    const totalPages = Math.ceil(total / limit);

    return ResponseBuilder.paginated(users, {
      page,
      limit,
      total,
      hasNext,
      hasPrev,
      totalPages,
    });
  }

  async getUserDetails(userId: string) {
    const user = await this.profileRepository.findUserWithDetails(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return ResponseBuilder.success(user);
  }

  //   async updateUserStatus(userId: string, updateStatusDto: UpdateUserStatusDto) {
  //     const existingUser = await this.profileRepository.getProfileById(userId);
  //     if (!existingUser) {
  //       throw new NotFoundException('User not found.');
  //     }

  //     const updatedUser = await this.userRepository.updateUserById(userId, {});

  //     const status = updatedUser.isBlocked ? 'blocked' : 'unblocked';
  //     return ResponseBuilder.updated(updatedUser, `User successfully ${status}.`);
  //   }
}
