import { Injectable } from '@nestjs/common';
import { I18nService, I18nContext } from 'nestjs-i18n';

@Injectable()
export class LangService {
  constructor(private i18nService: I18nService) {}

  getTranslation(message: any, param: any = null) {
    return this.i18nService.t(`messages.${message}`, {
      lang: I18nContext?.current()?.lang || 'zh',
      args: {
        data: param,
      },
    });
  }
  getErrorTranslation(message: any, param: any = null) {
    return this.i18nService.t(`error.${message}`, {
      lang: I18nContext?.current()?.lang || 'zh',
      args: {
        data: param,
      },
    });
  }
}
