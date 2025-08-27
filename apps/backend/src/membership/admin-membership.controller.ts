import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/types';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@ApiTags('Admin: Memberships')
@Auth(UserRole.ADMIN)
@Controller('admin/memberships')
export class AdminMembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get()
  @ApiOperation({ summary: 'List all memberships' })
  getAllMemberships() {
    return this.membershipService.getAllMemberships();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get membership by id' })
  getMembership(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipService.getMembershipById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new membership' })
  @ApiBody({ type: CreateMembershipDto })
  createMembership(@Body() dto: CreateMembershipDto) {
    return this.membershipService.createMembership(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a membership' })
  @ApiBody({ type: UpdateMembershipDto })
  updateMembership(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMembershipDto,
  ) {
    return this.membershipService.updateMembership(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a membership' })
  deleteMembership(@Param('id', ParseUUIDPipe) id: string) {
    return this.membershipService.deleteMembership(id);
  }
}


