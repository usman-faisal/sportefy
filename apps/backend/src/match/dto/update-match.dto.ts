import { PartialType , OmitType} from "@nestjs/mapped-types";
import {PartialType as PartialTypeSwagger, OmitType as OmitTypeSwagger} from "@nestjs/swagger"
import { CreateMatchDto } from "./create-match.dto";

export class UpdateMatchDto extends PartialType(OmitType(CreateMatchDto, ['playerLimit'])) {}

export class UpdateMatchDtoSwagger extends PartialTypeSwagger(OmitTypeSwagger(CreateMatchDto, ['playerLimit'])) {}