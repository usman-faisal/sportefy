// src/common/filters/drizzle-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DrizzleError } from 'drizzle-orm';
import { Response } from 'express';
import {
  ErrorHandlerService,
  DatabaseError,
} from '../services/error-handler.service';

@Catch() // Catch all unhandled exceptions
export class DrizzleExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DrizzleExceptionFilter.name);

  constructor(private readonly errorHandlerService: ErrorHandlerService) {}

  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log(error)

    // If the error is already a standard NestJS HTTP exception, let the framework handle it.
    // This preserves exceptions like NotFoundException thrown from the service layer.
    if (error instanceof HttpException) {
      response.status(error.getStatus()).json(error.getResponse());
      return;
    }

    const httpException = this.transformErrorToHttpException(error);

    const status = httpException.getStatus();
    const responseBody = httpException.getResponse();

    this.logger.error(
      `[${request.method} ${request.url}] - Status: ${status} - Error: ${JSON.stringify(responseBody)}`,
      error instanceof Error ? error.stack : '',
    );

    response.status(status).json(responseBody);
  }

  private transformErrorToHttpException(error: any): HttpException {
    const dbError = this.errorHandlerService.extractDatabaseError(error);

    if (dbError.code) {
      switch (dbError.code) {
        case '23503': // foreign_key_violation
          return new BadRequestException(
            this.errorHandlerService.getFriendlyForeignKeyMessage(
              dbError.constraint,
              dbError.detail,
            ),
          );

        case '23505': // unique_violation
          return new ConflictException(
            this.errorHandlerService.getFriendlyUniqueConstraintMessage(
              dbError.constraint,
              dbError.detail,
            ),
          );

        case '23502': // not_null_violation
          return new BadRequestException(
            this.errorHandlerService.getFriendlyNotNullMessage(
              dbError.column,
              dbError.message,
            ),
          );

        case '23514': // check_violation
          return new BadRequestException(
            this.errorHandlerService.getFriendlyCheckConstraintMessage(
              dbError.constraint,
              dbError.detail,
            ),
          );

        case '42P01': // undefined_table
          this.logger.error(`Table does not exist`, { error: dbError.detail });
          return new InternalServerErrorException(
            'Database configuration error.',
          );

        case '42703': // undefined_column
          this.logger.error(`Column does not exist`, { error: dbError.detail });
          return new InternalServerErrorException('Database schema error.');

        case '08006':
        case '08003':
        case '08000':
          this.logger.error(`Database connection error`, {
            error: dbError.detail,
          });
          return new InternalServerErrorException(
            'Database connection failed.',
          );

        default:
          this.logger.error(`Unhandled database error code: ${dbError.code}`, {
            message: dbError.message,
            detail: dbError.detail,
            stack: error.stack,
          });
          return new InternalServerErrorException(
            'An unexpected database error occurred.',
          );
      }
    }

    if (error instanceof DrizzleError) {
      this.logger.error(`Drizzle ORM error`, {
        message: error.message,
        stack: error.stack,
      });
      return new InternalServerErrorException('Database operation failed.');
    }

    // Fallback for any other type of error
    this.logger.error(`Unexpected error caught in filter`, {
      message: error.message,
      stack: error.stack,
    });
    return new InternalServerErrorException(
      'An unexpected error occurred on the server.',
    );
  }
}
