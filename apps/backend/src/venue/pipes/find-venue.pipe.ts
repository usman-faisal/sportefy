import { Injectable, PipeTransform, NotFoundException } from '@nestjs/common';
import { Venue } from '@sportefy/db-types';
import { VenueRepository } from '../venue.repository';

@Injectable()
export class FindVenuePipe implements PipeTransform<string, Promise<Venue>> {
  constructor(private readonly venueUtil: VenueRepository) {}

  async transform(venueId: string): Promise<Venue> {
    try {
      if (!venueId) {
        throw new NotFoundException('Venue ID is required');
      }
      console.log(venueId, 'venue');

      const venue = await this.venueUtil.getVenueById(venueId);

      if (!venue) {
        throw new NotFoundException('Venue not found');
      }

      return venue;
    } catch (error) {
      throw new NotFoundException('Venue not found');
    }
  }
}
