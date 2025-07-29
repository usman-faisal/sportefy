import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateVenueDto } from "./create-venue.dto";


export class UpdateVenueDto extends PartialType(
  OmitType(CreateVenueDto, ['operatingHours', 'media'] as const),
) {}
