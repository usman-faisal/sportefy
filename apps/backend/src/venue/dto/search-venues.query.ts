import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Availability, Space } from "src/common/types";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class SearchVenuesQuery extends PaginationDto {
    @ApiProperty({
        description: 'Filter by venue name (partial match)',
        required: false
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Filter by venue phone number',
        required: false
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    phoneNumber?: string;

    @ApiProperty({
        description: 'Filter by facility ID',
        required: false
    })
    @IsOptional()
    @IsUUID()
    facilityId?: string;

    @ApiProperty({
        description: 'Filter by sport ID',
        required: false
    })
    @IsOptional()
    @IsUUID()
    sportId?: string;

    @ApiProperty({
        description: 'Filter by availability status',
        enum: Availability,
        required: false
    })
    @IsOptional()
    @IsEnum(Availability)
    availability?: Availability;
    
    @ApiProperty({
        description: 'Filter by space type',
        enum: Space,
        required: false
    })
    @IsOptional()   
    @IsEnum(Space)
    spaceType?: Space;

    @ApiProperty({
        description: 'Filter by minimum capacity',
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    @Type(() => Number)
    capacity?: number;

    @ApiProperty({
        description: 'Filter by base price',
        required: false
    })
    @IsOptional()
    @IsNotEmpty()
    @Type(() => Number)
    basePrice?: number;
}