import { and, eq, ilike } from 'drizzle-orm';
import { SearchFacilitiesQuery } from './dto/search-facilities.query';
import {
  DRIZZLE_CLIENT,
  DrizzleClient,
} from 'src/common/providers/drizzle.provider';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { facilities, Facility, Profile } from '@sportefy/db-types';
import {
  MediaEntityType,
  PaginatedResult,
  Scope,
  ScopeRole,
} from 'src/common/types';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { FacilitiesWithInput, FacilityRepository } from './facility.repository';
import { UserScopeRepository } from 'src/user-scope/user-scope.repository';
import { SqlUnknown } from 'src/database/types';
import { OperatingHourRepository } from 'src/operating-hour/operating-hour.repository';
import { MediaRepository } from 'src/media/media.repository';
import { UnitOfWork } from 'src/common/services/unit-of-work.service';

@Injectable()
export class FacilityService {
  private readonly logger = new Logger(FacilityService.name);
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleClient,
    private readonly userScopeRepository: UserScopeRepository,
    private readonly operatingHourRepository: OperatingHourRepository,
    private readonly facilityRepository: FacilityRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  /**
   * Retrieves a paginated list of facilities based on search criteria.
   * @param searchQuery The search criteria for facilities.
   * @param pagination The pagination parameters.
   * @returns A paginated result of facilities.
   */
  async getFacilities(
    searchQuery: SearchFacilitiesQuery,
  ): Promise<PaginatedResult<Facility>> {
    const { limit, offset, page, ...otherSearchQuery } = searchQuery;
    const whereConditions = this.buildWhereConditions(otherSearchQuery);

    const total = await this.facilityRepository.count(whereConditions);
    const data = await this.facilityRepository.getManyFacilities(
      whereConditions,
      { venues: { with: { sports: { with: { sport: true } } } } },
      limit,
      offset,
      (facilities, { desc }) => desc(facilities.createdAt),
    );

    const paginationLimit = limit || 10;
    const paginationPage = page || 1;

    const totalPages = Math.ceil(total / paginationLimit);
    const hasNext = paginationPage < totalPages;
    const hasPrev = paginationPage > 1;
    this.logger.log(
      `Fetched ${data.length} facilities on page ${paginationPage} with limit ${paginationLimit}`,
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
   *
   * @param adminId The ID of the admin creating the facility.
   * Creates a new facility with the provided data.
   * Validates the owner ID and creates associated operating hours.
   * Throws BadRequestException if the owner ID is the same as the admin ID or if
   * @param createFacilityDto The data to create the facility.
   * @returns The created facility.
   */
  async createFacility(adminId: string, createFacilityDto: CreateFacilityDto) {
    const { operatingHours, media, ...facilityData } = createFacilityDto;

    const result = await this.unitOfWork.do(async (tx) => {
      const newFacility = await this.facilityRepository.createFacility({
        ...facilityData,
      });

      const [newUserScope] = await Promise.all([
        this.userScopeRepository.createUserScope(
          {
            userId: createFacilityDto.ownerId,
            facilityId: newFacility.id,
            grantedAt: new Date(),
            grantedBy: adminId,
            role: ScopeRole.OWNER,
          },
          tx,
        ),
        operatingHours.length > 0 &&
          this.operatingHourRepository.createManyOperatingHours(
            operatingHours.map(
              (hour) => ({
                ...hour,
                facilityId: newFacility.id,
                scope: Scope.FACILITY,
              }),
              tx,
            ),
          ),
        media.length > 0 &&
          this.mediaRepository.createManyMedia(
            createFacilityDto.media.map(
              (media) => ({
                ...media,
                entityId: newFacility.id,
                entityType: MediaEntityType.FACILITY,
              }),
              tx,
            ),
          ),
      ]);

      return [newFacility, newUserScope];
    });

    this.logger.log(`New facility created by admin ID: ${adminId}`);

    return ResponseBuilder.created(result, 'New Facility Created');
  }

  /**
   * Updates an existing facility.
   * @param user The user performing the update.
   * @param facility The facility to update.
   * @param updateFacilityDto The data to update the facility.
   * @returns The updated facility.
   */
  async updateFacility(
    user: Profile,
    facility: Facility,
    updateFacilityDto: UpdateFacilityDto,
  ) {
    await this.unitOfWork.do(async (tx) => {
      await this.facilityRepository.updateFacilityById(facility.id, {
        ...updateFacilityDto,
      });
    });

    this.logger.log(
      `Facility with ID: ${facility.id} updated by user ID: ${user.id}`,
    );
    const updatedFacility = await this.getFacility(facility.id);
    return ResponseBuilder.updated(updatedFacility.data, 'Facility updated');
  }

  /**
   * Retrieves a facility by its ID.
   * @param facilityId The ID of the facility to retrieve.
   * @param facilitiesWithInput Optional input to specify related data to include.
   * @returns The facility with related data.
   */
  async getFacility(
    facilityId: string,
    facilitiesWithInput: FacilitiesWithInput = {
      operatingHours: true,
      venues: true,
      owner: {
        with: {
          profile: true,
        },
      },
      media: true,
    },
  ) {
    const facility = await this.facilityRepository.getFacility(
      eq(facilities.id, facilityId),
      facilitiesWithInput,
    );

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    return ResponseBuilder.success(facility, 'Facility found');
  }

  /**
   * Deletes a facility.
   * @param user The user performing the deletion.
   * @param facility The facility to delete.
   * @returns A success message.
   */
  async deleteFacility(user: Profile, facility: Facility) {
    await this.facilityRepository.deleteFacilityById(facility.id);

    this.logger.log(
      `Facility with ID: ${facility.id} deleted by user ID: ${user.id}`,
    );
    return ResponseBuilder.deleted('Facility deleted successfully');
  }

  /**
   * Builds the where conditions for facility search based on the query parameters.
   * @param query The search query parameters.
   * @returns The where conditions for the query.
   */
  private buildWhereConditions(
    query: Partial<SearchFacilitiesQuery>,
  ): SqlUnknown | undefined {
    const conditions: any[] = [];

    if (query.name) {
      conditions.push(ilike(facilities.name, `%${query.name}%`));
    }

    if (query.description) {
      conditions.push(ilike(facilities.description, `%${query.description}%`));
    }

    if (query.address) {
      conditions.push(eq(facilities.address, query.address));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }
}
