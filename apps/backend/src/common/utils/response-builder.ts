// src/common/utils/response-builder.ts
import { PaginatedResult } from "../types";

export type ResponseType<T> = PaginatedResult<T> | {
    data: T;
    success: boolean;
    message?: string;
};

export class ResponseBuilder {
    // For paginated responses
    static paginated<T>(
        data: T[],
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        }
    ): PaginatedResult<T> {
        return {
            data,
            pagination
        };
    }

    // For single item responses
    static success<T>(data: T, message?: string): { data: T; success: boolean; message?: string } {
        return {
            data,
            success: true,
            message
        };
    }

    // For error responses
    static error<T = null>(message: string, data: T = null as T): { data: T; success: boolean; message: string } {
        return {
            data,
            success: false,
            message
        };
    }

    // For created responses
    static created<T>(data: T, message: string = 'Resource created successfully'): { data: T; success: boolean; message: string } {
        return {
            data,
            success: true,
            message
        };
    }

    // For updated responses
    static updated<T>(data: T, message: string = 'Resource updated successfully'): { data: T; success: boolean; message: string } {
        return {
            data,
            success: true,
            message
        };
    }

    // For deleted responses
    static deleted(message: string = 'Resource deleted successfully'): { data: null; success: boolean; message: string } {
        return {
            data: null,
            success: true,
            message
        };
    }
}