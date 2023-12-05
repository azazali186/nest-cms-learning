import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import logger from 'src/utils/logger';
import { ApiResponse } from 'src/utils2/response.util';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const req = ctx.getRequest<any>();
    const status = exception.getStatus();

    logger.error(exception.getResponse());

    const lang = req.headers?.lang?.toLowerCase() || 'zh';

    let errorResponse: any; // Define a variable to store the error response

    if (typeof exception.getResponse() === 'object') {
      errorResponse = exception.getResponse();
    } else {
      // If it's a string, create an object with an 'error' property
      errorResponse = { error: exception.getResponse() as string };
    }
    console.log(exception);
    const data = new Set(errorResponse.message.toString().split(','));
    const translatedMessage = [];
    data.forEach((d) => {
      const msg = this.i18n.t(`error.${d}`, {
        lang,
        args: { data: errorResponse.param },
      });
      if (msg.includes('error.')) {
        translatedMessage.push(d);
      } else {
        translatedMessage.push(msg);
      }
    });

    const res = ApiResponse(null, status, null, translatedMessage);

    response.status(status).json(res);
  }
}
