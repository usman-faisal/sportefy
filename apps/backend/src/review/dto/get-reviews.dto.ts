import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class GetReviewsQuery extends PaginationDto{
    @ApiProperty({
        description: "The ID of the venue to get reviews for",
        type: String,
        example: "123e4567-e89b-12d3-a456-42661417400",
    })
    @IsUUID()
    venueId: string;
}