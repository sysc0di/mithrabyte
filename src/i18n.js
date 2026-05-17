import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const validLocales = ['en', 'tr'];
  const currentLocale = validLocales.includes(locale) ? locale : 'en';
  
  return {
    locale: currentLocale,
    messages: (await import(`./messages/${currentLocale}.json`)).default
  };
});
