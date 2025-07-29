import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Inject,
  Logger,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Profile } from '@sportefy/db-types';
import { CreateUserScopeDtoOmitGranted } from '../dto/create-user-scope.dto';
import { AuthenticatedRequest, ScopeRole, UserRole } from 'src/common/types';

@Injectable()
export class UserScopeFacilityValidationPipe implements PipeTransform {
  private readonly logger = new Logger(UserScopeFacilityValidationPipe.name);

  constructor(
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (
      metadata.type === 'body' &&
      value instanceof CreateUserScopeDtoOmitGranted
    ) {
      if (this.request.user.role !== UserRole.ADMIN) {
        this.logger.log(
          `Non-admin user ${this.request.user.id} role restricted to MODERATOR`,
        );
        value.role = ScopeRole.MODERATOR;
      }
    }
    return value;
  }
}
