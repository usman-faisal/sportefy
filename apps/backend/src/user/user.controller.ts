import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/types';
import { SearchUsersDto } from './dto/search-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserService } from './user.service';

@ApiTags('Admin: User Management')
@Auth(UserRole.ADMIN)
@Controller('admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get a list of all users with search' })
  getAllUsers(@Query() searchQuery: SearchUsersDto) {
    return this.userService.getAllUsers(searchQuery);
  }

  @Get(':id')
  @ApiOperation({
    summary: "View a user's profile, booking history, and credit history",
  })
  getUserDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUserDetails(id);
  }

  //   @Patch(':id/status')
  //   @ApiOperation({ summary: 'Block or unblock a user' })
  //   updateUserStatus(
  //     @Param('id', ParseUUIDPipe) id: string,
  //     @Body() updateStatusDto: UpdateUserStatusDto,
  //   ) {
  //     return this.userManagementService.updateUserStatus(id, updateStatusDto);
  //   }
}
