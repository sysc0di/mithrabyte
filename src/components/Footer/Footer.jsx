"use client";
import styles from './footer.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.left}>
          <div className={styles.logo}>
            <Image src="/logo.svg" alt="Logo" width={120} height={40} />
          </div>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {t('copyright')}
          </p>
        </div>

        {/* Menü linkleri */}
        <div className={styles.links}>
          <Link href={`/${locale}`} className={styles.link}>{t('home')}</Link>
          <Link className={styles.link} href={`/${locale}/packages`} >{t('packages')}</Link>
          <Link href={`/${locale}/aboutus`} className={styles.link}>{t('about')}</Link>
          <Link href={`/${locale}/services`} className={styles.link}>{t('services')}</Link>
          <Link href={`/${locale}/contact`} className={styles.link}>{t('contact')}</Link>
        </div>
      </div>
    </footer>
  );
}
