import { getRequestConfig } from 'next-intl/server';

function mergeMessages(base, override) {
  const output = { ...base };
  for (const [key, value] of Object.entries(override)) {
    output[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? mergeMessages(base[key] || {}, value)
      : value;
  }
  return output;
}

export default getRequestConfig(async ({ locale }) => {
  const validLocales = ['en', 'tr'];
  const currentLocale = validLocales.includes(locale) ? locale : 'en';
  const fallbackMessages = (await import('./messages/en.json')).default;
  const localeMessages = currentLocale === 'en' ? fallbackMessages : (await import('./messages/tr.json')).default;
  return {
    locale: currentLocale,
    messages: mergeMessages(fallbackMessages, localeMessages)
  };
});
