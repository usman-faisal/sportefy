// src/facility/pipes/find-facility.pipe.ts
import { Injectable, PipeTransform, NotFoundException } from '@nestjs/common';
import { facilities, Facility } from '@sportefy/db-types';
import { FacilityRepository } from '../facility.repository';
import { eq } from 'drizzle-orm';

@Injectable()
export class FindFacilityPipe
  implements PipeTransform<string, Promise<Facility>>
{
  constructor(private readonly facilityRepository: FacilityRepository) {}

  /**
   * Transforms the facility ID into a Facility object.
   * @param facilityId The ID of the facility to find.
   * @returns The found Facility object.
   * @throws NotFoundException if the facility is not found.
   */
  async transform(facilityId: string): Promise<Facility> {
    if (!facilityId) {
      throw new NotFoundException('Facility ID is required');
    }

    const facility = await this.facilityRepository.getFacility(
      eq(facilities.id, facilityId),
    );

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    return facility;
  }
}
