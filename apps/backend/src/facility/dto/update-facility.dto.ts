import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateFacilityDto } from "./create-facility.dto";

export class UpdateFacilityDto extends PartialType(
    OmitType(CreateFacilityDto, ['operatingHours', 'ownerId', 'media'] as const),
) {}
