import { OmitType } from "@nestjs/mapped-types";
import { CreateMaintenanceScheduleDto } from "./create-maintenance-schedule.dto";


export class UpdateMaintenanceScheduleDto extends OmitType(CreateMaintenanceScheduleDto, ['scheduledBy']) {}