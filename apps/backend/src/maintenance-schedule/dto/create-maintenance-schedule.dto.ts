import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { CreateSlotDto } from "src/slot/dto/create-slot.dto";


export class CreateMaintenanceScheduleDto {
    
    @ApiProperty({ type: CreateSlotDto })
    @Type(() => CreateSlotDto)
    slot: CreateSlotDto;
    
    @ApiProperty({
        description: 'The reason for the maintenance schedule',
        type: String,
        example: 'Routine maintenance',
        required: false,
    })
    reason?: string;

    @ApiProperty({
        description: 'The ID of the admin who scheduled the maintenance',
        type: String,
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,    
    })
    scheduledBy?: string;
}