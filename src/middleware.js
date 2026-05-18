// middleware.js
import { NextResponse } from 'next/server';

const locales = ['en', 'tr'];
const defaultLocale = 'tr';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Statik dosyaları ve API isteklerini atla
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(.*)$/)
  ) {
    return;
  }

  // URL'de zaten desteklenen bir dil varsa (/tr veya /en ile başlıyorsa) devam et
  if (locales.some(locale => pathname.startsWith(`/${locale}`))) {
    return;
  }

  // --- GÜNCEL DİL TESPİT MANTIĞI ---
  
  // 1. Önce kullanıcının dil değiştirici (switcher) ile seçtiği çerezdeki dile bakıyoruz
  let locale = req.cookies.get('NEXT_LOCALE')?.value;

  // 2. Eğer çerez yoksa veya geçersizse, tarayıcı dilini alıp ona göre düşüyoruz
  if (!locale || !locales.includes(locale)) {
    const langHeader = req.headers.get('accept-language');
    const browserLang = langHeader?.split(',')[0]?.split('-')[0];
    locale = locales.includes(browserLang) ? browserLang : defaultLocale;
  }

  // Tespit edilen dile göre URL'i yeniden yapılandır ve yönlendir
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};