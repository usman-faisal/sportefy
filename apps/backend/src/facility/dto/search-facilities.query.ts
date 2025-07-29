// In your facility module, e.g., src/facility/dto/get-facilities-query.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto'; // Adjust path as needed

export class SearchFacilitiesQuery extends PaginationDto {
    @ApiProperty({
        description: 'Filter by facility name (partial match)',
        required: false
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty() // This means if 'name' is provided, it cannot be an empty string
    name?: string;

    @ApiProperty({
        description: 'Filter by facility description (partial match)',
        required: false
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @ApiProperty({
        description: 'Filter by facility phone number',
        required: false
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    phoneNumber?: string;

    @ApiProperty({
        description: 'Filter by facility address (partial match)',
        required: false
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    address?: string;
}