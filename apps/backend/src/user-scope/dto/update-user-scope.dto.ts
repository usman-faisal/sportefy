import { OmitType } from '@nestjs/swagger';
import { CreateUserScopeDto } from './create-user-scope.dto';
import { PartialType } from '@nestjs/mapped-types';

export class AddUserScopeVenueDto extends PartialType(
  OmitType(CreateUserScopeDto, [
    'grantedBy',
    'grantedAt',
    'scopeId',
    'scope',
    'role',
  ]),
) {}
