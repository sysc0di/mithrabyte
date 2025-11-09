"use client";
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import styles from './navbar.module.css';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale) => {
    if (newLocale === locale) return;
    
    // Get current path without locale
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'tr' || segments[0] === 'en') {
      segments.shift(); // Remove locale from segments
    }
    
    const pathWithoutLocale = segments.length > 0 ? `/${segments.join('/')}` : '/';
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

