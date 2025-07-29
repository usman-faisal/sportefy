import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SearchVenuesQuery } from './dto/search-venues.query';
import { MediaEntityType, PaginatedResult, Scope } from 'src/common/types';
import { Venue, venues } from '@sportefy/db-types';
import { and, eq, exists, ilike } from 'drizzle-orm';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenueRepository } from './venue.repository';
import { SQL } from 'drizzle-orm';
import { OperatingHourRepository } from 'src/operating-hour/operating-hour.repository';
import { MediaRepository } from 'src/media/media.repository';
import { venueSports } from '@sportefy/db-types';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';

@Injectable()
export class VenueService {
  private readonly logger = new Logger(VenueService.name);
  constructor(
    private readonly venueRepository: VenueRepository,
    private readonly operatingHourRepository: OperatingHourRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  /**
   * Retrieves a paginated list of venues based on search criteria.
   * @param searchQuery The search criteria for venues.
   * @param pagination The pagination parameters.
   * @returns A paginated result of venues.
   */
  async getVenues(
    searchQuery: SearchVenuesQuery,
  ): Promise<PaginatedResult<Venue>> {
    const { limit, offset, page, ...otherSearchQuery } = searchQuery;
    const whereConditions = this.buildWhereConditions(otherSearchQuery);

    const total = await this.venueRepository.count(whereConditions);
    const data = await this.venueRepository.getManyVenues(
      whereConditions,
      {
        operatingHours: true,
        media: true,
        sports: { with: { sport: true } },
      },
      limit,
      offset,
      (venues, { desc }) => desc(venues.createdAt),
    );

    const paginationLimit = limit || 10;
    const paginationPage = page || 1;

    const totalPages = Math.ceil(total / paginationLimit);
    const hasNext = paginationPage < totalPages;
    const hasPrev = paginationPage > 1;

    this.logger.log(
      `Fetched ${data.length} venues on page ${paginationPage} with limit ${paginationLimit}`,
    );
    return ResponseBuilder.paginated(data, {
      page: paginationPage,
      limit: paginationLimit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    });
  }
  /**
   * Retrieves a venue by its ID.
   * @param id The ID of the venue to retrieve.
   * @returns The found venue.
   */
  async getVenue(id: string) {
    const venue = await this.venueRepository.getVenueById(id, {
      operatingHours: true,
      facility: true,
      sports: {
        with: {
          sport: true,
        },
      },
      media: true,
    });

    if (!venue) {
      throw new NotFoundException(`Venue with id ${id} not found`);
    }

    return ResponseBuilder.success(venue, 'Venue retrieved successfully');
  }

  /**
   * Creates a new venue.
   * @param createVenueDto The data to create the venue.
   * @returns The created venue.
   */
  async createVenue(facilityId: string, createVenueDto: CreateVenueDto) {
    const { operatingHours, sportIds, media, ...venueData } = createVenueDto;

    const venue = await this.unitOfWork.do(async (tx) => {
      const newVenue = await this.venueRepository.createVenue(
        {
          ...venueData,
          facilityId,
        },
        tx,
      );

      if (sportIds && sportIds.length > 0) {
        const sportLinks = sportIds.map((sportId) => ({
          venueId: newVenue.id,
          sportId: sportId,
        }));

        await tx.insert(venueSports).values(sportLinks);
      }

      if (operatingHours && operatingHours.length > 0) {
        await this.operatingHourRepository.createManyOperatingHours(
          operatingHours.map((hour) => ({
            ...hour,
            venueId: newVenue.id,
            scope: Scope.VENUE,
          })),
          tx,
        );
      }

      if (media && media.length > 0) {
        await this.mediaRepository.createManyMedia(
          createVenueDto.media.map((media) => ({
            ...media,
            entityId: newVenue.id,
            entityType: MediaEntityType.VENUE,
          })),
          tx,
        );
      }

      return newVenue;
    });

    return ResponseBuilder.created(venue, 'Venue created successfully');
  }

  /**
   * Updates an existing venue.
   * @param venueId The ID of the venue to update.
   * @param updateVenueDto The data to update the venue.
   * @returns The updated venue.
   */
  async updateVenue(venueId: string, updateVenueDto: UpdateVenueDto) {
    const { sportIds, ...venueData } = updateVenueDto;

    const updatedVenue = await this.unitOfWork.do(async (tx) => {
      const [venue] = await this.venueRepository.updateVenueById(
        venueId,
        updateVenueDto,
        tx,
      );

      if (!venue) {
        throw new NotFoundException(`Venue with id ${venueId} not found`);
      }

      if (sportIds) {
        // delete all previous insert new
        await tx.delete(venueSports).where(eq(venueSports.venueId, venueId));

        if (sportIds.length > 0) {
          const newSportLinks = sportIds.map((sportId) => ({
            venueId: venueId,
            sportId: sportId,
          }));
          await tx.insert(venueSports).values(newSportLinks);
        }
      }

      return venue;
    });
    return ResponseBuilder.updated(updatedVenue, 'Venue updated successfully');
  }

  /**
   * Deletes a venue by its ID.
   * @param venueId The ID of the venue to delete.
   * @returns A response indicating the deletion status.
   */
  async deleteVenue(venueId: string) {
    await this.unitOfWork.do(async (tx) => {
      const [venue] = await this.venueRepository.deleteVenueById(venueId, tx);

      if (!venue) {
        throw new NotFoundException(`Venue with id ${venueId} not found`);
      }

      return venue;
    });

    return ResponseBuilder.deleted(
      `Venue with id ${venueId} deleted successfully`,
    );
  }

  /**
   * Builds the where conditions for searching venues based on the search query.
   * @param searchQuery The search criteria for venues.
   * @returns SQL conditions for the query.
   */
  private buildWhereConditions(
    query: Partial<SearchVenuesQuery>,
  ): SQL<unknown> | undefined {
    const conditions: any[] = [];

    if (query.name) {
      conditions.push(ilike(venues.name, `%${query.name}%`));
    }

    if (query.phoneNumber) {
      conditions.push(ilike(venues.phoneNumber, `%${query.phoneNumber}%`));
    }

    if (query.facilityId) {
      conditions.push(eq(venues.facilityId, query.facilityId));
    }

    if (query.sportId) {
      conditions.push(
        exists(
          this.venueRepository.db
            .select()
            .from(venueSports)
            .where(
              and(
                eq(venueSports.venueId, venues.id),
                eq(venueSports.sportId, query.sportId),
              ),
            ),
        ),
      );
    }

    if (query.availability) {
      conditions.push(eq(venues.availability, query.availability));
    }

    if (query.spaceType) {
      conditions.push(eq(venues.spaceType, query.spaceType));
    }

    if (query.capacity) {
      conditions.push(eq(venues.capacity, query.capacity));
    }

    if (query.basePrice) {
      conditions.push(eq(venues.basePrice, query.basePrice));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }
}
