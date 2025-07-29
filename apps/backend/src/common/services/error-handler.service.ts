
import {
    Injectable,
} from '@nestjs/common';

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export interface DatabaseError { // Changed to export
    code?: string;
    constraint?: string;
    detail?: string;
    message?: string;
    table?: string;
    column?: string;
}

@Injectable()
export class ErrorHandlerService {
    public extractDatabaseError(error: any): DatabaseError {
        if (typeof error.code === 'string' && error.code.match(/^\d+$/)) {
            return {
                code: error.code,
                constraint: error.constraint,
                detail: error.detail,
                message: error.message,
                table: error.table,
                column: error.column,
            };
        }

        const nestedError = error.cause || error.driverError || error.original;
        if (nestedError) {
            return this.extractDatabaseError(nestedError);
        }

        return { message: error.message, code: error.code };
    }

    public getFriendlyUniqueConstraintMessage(constraint?: string, detail?: string): string {
        const detailMatch = detail?.match(/Key \((.*?)\)=\((.*?)\) already exists\./);

        if (detailMatch) {
            const field = detailMatch[1].replace(/_/g, ' ');
            const value = detailMatch[2];
            return `A record with the ${field} '${value}' already exists. Please use a different ${field}.`;
        }

        const constraintMessages: Record<string, string> = {
            'users_email_unique': 'This email address is already registered.',
            'profiles_user_name_unique': 'This username is already taken.',
        };
        if (constraint && constraintMessages[constraint]) {
            return constraintMessages[constraint];
        }

        return 'This resource already exists or conflicts with another.';
    }

    public getFriendlyForeignKeyMessage(constraint?: string, detail?: string): string {
        const detailMatch = detail?.match(/Key \((.*?)\)=\((.*?)\) is not present in table "(.*?)"\./);

        if (detailMatch) {
            const field = detailMatch[1].replace(/_/g, ' ');
            const table = detailMatch[3].replace(/s$/, ''); // singularize
            return `The specified ${table} does not exist for the '${field}' field.`;
        }
        
        if (constraint === 'bookings_venue_id_venues_id_fk') {
             return 'The specified venue could not be found.';
        }

        return 'A related resource could not be found or does not exist.';
    }

    public getFriendlyNotNullMessage(column?: string, detail?: string): string {
        if (column) {
            const fieldName = column.replace(/_/g, ' ');
            return `${capitalize(fieldName)} is required and cannot be empty.`;
        }
        return 'A required field was not provided.';
    }

    public getFriendlyCheckConstraintMessage(constraint?: string, detail?: string): string {
        if (!constraint) {
            return 'The provided data does not meet the required criteria.';
        }
        const constraintMessages: Record<string, string> = {
            'users_email_check': 'Please provide a valid email address.',
            'profiles_age_check': 'Age must be a positive number less than 100.',
            'facilities_rating_check': 'Rating must be between 1 and 5.',
        };
        return constraintMessages[constraint] || 'A validation check failed for the provided data.';
    }
}