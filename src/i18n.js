import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = requestLocale || 'tr';

  try {
    return {
      locale,
      messages: (await import(`./messages/${locale}.json`)).default
    };
  } catch {
    return {
      locale: 'tr',
      messages: (await import(`./messages/tr.json`)).default
    };
  }
});
