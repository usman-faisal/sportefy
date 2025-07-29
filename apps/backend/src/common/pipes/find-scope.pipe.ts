// src/common/pipes/find-scope.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { FacilityRepository } from 'src/facility/facility.repository';
import { VenueRepository } from 'src/venue/venue.repository';
import { Scope } from '../types';
import { Facility, Venue } from '@sportefy/db-types';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class FindScopePipe
  implements PipeTransform<string, Promise<Facility | Venue>>
{
  constructor(
    private readonly facilityRepository: FacilityRepository,
    private readonly venueRepository: VenueRepository,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async transform(
    value: string,
    metadata: ArgumentMetadata,
  ): Promise<Facility | Venue> {
    const scopeId = value;

    const request = this.request;
    const scopeParam = request.params.scope;

    if (!scopeParam) {
      throw new InternalServerErrorException(
        'FindScopePipe requires a ":scope" parameter in the route.',
      );
    }

    let entity: Facility | Venue | undefined;

    switch (scopeParam.toUpperCase()) {
      case Scope.FACILITY:
        entity = await this.facilityRepository.getFacilityById(scopeId);
        if (!entity) {
          throw new NotFoundException(
            `Facility with ID "${scopeId}" not found.`,
          );
        }
        break;

      case Scope.VENUE:
        entity = await this.venueRepository.getVenueById(scopeId);
        if (!entity) {
          throw new NotFoundException(`Venue with ID "${scopeId}" not found.`);
        }
        break;

      default:
        throw new BadRequestException(
          `Invalid scope "${scopeParam}". Must be 'facility' or 'venue'.`,
        );
    }

    return entity;
  }
}
