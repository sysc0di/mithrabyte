import { NextResponse } from 'next/server';

const locales = ['en', 'tr'];
const defaultLocale = 'tr';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(.*)$/)
  ) {
    return;
  }

  if (locales.some(locale => pathname.startsWith(`/${locale}`))) {
    return;
  }

  const langHeader = req.headers.get('accept-language');
  const browserLang = langHeader?.split(',')[0]?.split('-')[0];
  const locale = locales.includes(browserLang) ? browserLang : defaultLocale;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
