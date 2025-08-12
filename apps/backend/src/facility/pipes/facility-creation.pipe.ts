import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, Inject } from '@nestjs/common';
import { CreateFacilityDto } from '../dto/create-facility.dto';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from 'src/common/types';

@Injectable()
export class FacilityCreationPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: AuthenticatedRequest) {}
  transform(value: CreateFacilityDto, metadata: ArgumentMetadata) {
    const user = this.request.user;
    if (!user) {
        throw new BadRequestException('User not found in request');
    }

    return value;
  }
}