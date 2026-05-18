"use client";
import { useRouter, usePathname } from 'next/navigation';
import styles from './navbar.module.css';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const switchLocale = (newLocale) => {
    // Eğer zaten aktif olan dile tıklandıysa hiçbir şey yapma (Düzeltildi)
    if (newLocale === locale) return; 

    // 1. Mevcut localStorage kaydın aynen duruyor
    localStorage.setItem('locale', newLocale);

    // 2. KRİTİK EKLEME: Middleware'in sayfalar arası geçişte dili hatırlaması için çereze yazıyoruz (1 Yıl Geçerli)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;

    // URL'den mevcut dil kodunu temizleme adımları
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'tr' || segments[0] === 'en') {
      segments.shift(); // Mevcut dili diziden çıkar
    }
    
    const pathWithoutLocale = segments.length > 0 ? `/${segments.join('/')}` : '/';
    
    // Yeni dille birlikte yönlendir (/tr/contact veya /en/contact gibi)
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        onClick={() => switchLocale('tr')}
        className={locale === 'tr' ? styles.activeLanguage : ''}
        aria-label="Switch to Turkish"
      >
        TR
      </button>
      <span className={styles.languageSeparator}>/</span>
      <button
        onClick={() => switchLocale('en')}
        className={locale === 'en' ? styles.activeLanguage : ''}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}