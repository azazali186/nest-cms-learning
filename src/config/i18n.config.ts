// i18n.config.ts
import { I18nOptions } from 'nestjs-i18n';
import * as path from 'path';
import { AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';

export const i18nConfig: I18nOptions = {
  fallbackLanguage: 'zh',
  fallbacks: {
    en: 'en',
    zh: 'zh',
    km: 'km',
  },
  loaderOptions: {
    path: path.join(__dirname, '../i18n/'),
    watch: true,
  },
  resolvers: [
    { use: QueryResolver, options: ['lang'] },
    AcceptLanguageResolver,
  ],
};
