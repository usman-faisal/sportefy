// src/slot/dto/create-slot.dto.ts

import { ApiProperty } from "@nestjs/swagger";
import { IsDate } from "class-validator";
import { Type } from "class-transformer";

export class CreateSlotDto {
    @ApiProperty({
        description: 'The start time of the slot',
        type: String,
        format: 'date-time',
        example: '2024-07-15T10:30:00Z',
    })
    @Type(() => Date) // Transforms the incoming string to a Date object
    @IsDate()       // Validates that the transformed property is a Date object
    startTime: Date;

    @ApiProperty({
        description: 'The end time of the slot',
        type: String,
        format: 'date-time',
        example: '2024-07-15T12:00:00Z',
    })
    @Type(() => Date) // Transforms the incoming string to a Date object
    @IsDate()       // Validates that the transformed property is a Date object
    endTime: Date;
}