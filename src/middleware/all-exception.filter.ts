import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Response } from "express";
import logger from "../utils2/logger";
import { LangService } from "../services/lang.service";

@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly i18n: LangService,
  ) {}

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const responseBody = {
      statusCode: HttpStatus.CONFLICT,
      error: exception.driverError.message,
    };
    switch (exception.driverError.code) {
      case 'ER_DUP_ENTRY':
        const match = /Duplicate entry '(.*?)' for key/.exec(
          exception.driverError.message,
        );
        const duplicatedValue = match ? match[1] : null;
        responseBody['message'] = this.i18n.getErrorTranslation("ALREADY_EXIST",duplicatedValue);
        break;
      default: {
      }
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.CONFLICT);
  }
}
