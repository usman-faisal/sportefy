import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { operatingHours } from '@sportefy/db-types';
import { CreateOperatingHourDto } from './dto/create-operating-hour.dto';
import { Scope } from 'src/common/types';
import { OperatingHourRepository } from './operating-hour.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';
import { getScopeField, getScopeId } from 'src/common/utils/user-scope';

@Injectable()
export class OperatingHourService {
  private readonly logger = new Logger(OperatingHourService.name);

  constructor(
    private readonly operatingHourRepository: OperatingHourRepository,
  ) {}

  async getOperatingHours(scopeId: string, scope: Scope) {
    const whereCondition = eq(getScopeId(scope), scopeId);

    const operatingHoursList =
      await this.operatingHourRepository.getManyOperatingHours(
        whereCondition,
        undefined,
        undefined,
        undefined,
        (operatingHours, { asc }) => [
          asc(operatingHours.dayOfWeek),
          asc(operatingHours.openTime),
          asc(operatingHours.closeTime),
        ],
      );

    if (operatingHoursList.length === 0) {
      throw new HttpException('No operating hours found', 404);
    }

    this.logger.log(
      `Retrieved ${operatingHoursList.length} operating hours for ${scope} with ID ${scopeId}`,
    );

    return ResponseBuilder.success(
      operatingHoursList,
      'Operating hours retrieved successfully',
    );
  }

  async addOperatingHour(
    scopeId: string,
    scope: Scope,
    hoursData: CreateOperatingHourDto,
  ) {
    const operatingHourData = {
      ...hoursData,
      [getScopeField(scope)]: scopeId,
    };

    const newOperatingHour =
      await this.operatingHourRepository.createOperatingHour(operatingHourData);

    this.logger.log(`Added new operating hour for ${scope} with ID ${scopeId}`);

    return ResponseBuilder.created(
      newOperatingHour,
      'Operating hour added successfully',
    );
  }

  async addOperatingHours(
    scopeId: string,
    scope: Scope,
    hoursData: CreateOperatingHourDto[],
  ) {
    const operatingHoursData = hoursData.map((hour) => ({
      ...hour,
      [getScopeField(scope)]: scopeId,
    }));

    const newOperatingHours =
      await this.operatingHourRepository.createManyOperatingHours(
        operatingHoursData,
      );

    this.logger.log(
      `Added ${newOperatingHours.length} operating hours for ${scope} with ID ${scopeId}`,
    );

    return ResponseBuilder.created(
      newOperatingHours,
      'Operating hours added successfully',
    );
  }

  async updateOperatingHour(
    scopeId: string,
    scope: Scope,
    hourId: number,
    updateData: CreateOperatingHourDto,
  ) {
    const whereCondition = eq(getScopeId(scope), scopeId);

    const updatedOperatingHour =
      await this.operatingHourRepository.updateOperatingHour(
        and(whereCondition, eq(operatingHours.id, hourId)),
        updateData,
      );

    if (updatedOperatingHour.length === 0) {
      throw new HttpException('Operating hour not found', 404);
    }

    this.logger.log(
      `Updated operating hour with ID ${hourId} for ${scope} with ID ${scopeId}`,
    );

    return ResponseBuilder.updated(
      updatedOperatingHour[0],
      'Operating hour updated successfully',
    );
  }

  async deleteOperatingHour(scopeId: string, scope: Scope, hourId: number) {
    const whereCondition = eq(getScopeId(scope), scopeId);

    const deletedOperatingHour =
      await this.operatingHourRepository.deleteOperatingHour(
        and(whereCondition, eq(operatingHours.id, hourId)),
      );

    if (deletedOperatingHour.length === 0) {
      throw new HttpException('Operating hour not found', 404);
    }

    this.logger.log(
      `Deleted operating hour with ID ${hourId} for ${scope} with ID ${scopeId}`,
    );

    return ResponseBuilder.deleted('Operating hour deleted successfully');
  }

  async deleteOperatingHours(scopeId: string, scope: Scope) {
    const whereCondition = eq(getScopeId(scope), scopeId);

    const deletedOperatingHours =
      await this.operatingHourRepository.deleteOperatingHour(whereCondition);

    if (deletedOperatingHours.length === 0) {
      throw new HttpException('No operating hours found for deletion', 404);
    }

    this.logger.log(
      `Deleted ${deletedOperatingHours.length} operating hours for ${scope} with ID ${scopeId}`,
    );

    return ResponseBuilder.deleted('Operating hours deleted successfully');
  }
}
