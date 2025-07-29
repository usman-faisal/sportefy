import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsUUID } from 'class-validator';
import { Scope, ScopeRole } from 'src/common/types';

export class CreateUserScopeDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  scopeId: string;

  @ApiProperty()
  @IsEnum(Scope)
  scope: Scope;

  @ApiProperty()
  @IsUUID()
  grantedBy: string;

  @ApiProperty()
  @IsDate()
  grantedAt: Date;

  @ApiProperty()
  @IsEnum(ScopeRole)
  role: ScopeRole;
}

export class CreateUserScopeDtoOmitGranted extends OmitType(
  CreateUserScopeDto,
  ['grantedBy', 'grantedAt', 'scopeId', 'scope'],
) {}
