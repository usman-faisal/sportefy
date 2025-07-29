import { CreateOperatingHourDto } from './create-operating-hour.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateOperatingHourDto extends PartialType(
  CreateOperatingHourDto,
) {}
