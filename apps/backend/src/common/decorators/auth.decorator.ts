import { applyDecorators, UseGuards } from "@nestjs/common";
import { UserRole } from "../types";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { Roles } from "./roles.decorator";

export function Auth(...roles: UserRole[]) {
    return applyDecorators(
        Roles(...roles),
        ApiBearerAuth('access-token'),
        ApiResponse({ status: 401, description: 'Unauthorized.' }),
        ApiResponse({ status: 403, description: 'Forbidden.' })
    )
}