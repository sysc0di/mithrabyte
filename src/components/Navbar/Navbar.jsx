"use client";
import React, { useEffect, useState } from 'react'
import styles from "./navbar.module.css";
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Logs } from 'lucide-react';
import SidebarMenu from './SidebarMenu';
import ThemeSwticher from './ThemeSwticher';
import LanguageSwitcher from './LanguageSwitcher';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const t = useTranslations('nav');
    const locale = localStorage.getItem("locale");

  return (
    <div className={styles.navbarcontanier} >
            <SidebarMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={`${styles.emptydiv} ${styles.emptydivleft}`} ></div>
      <div className={styles.navbar} >
        <div className={styles.logo}>
          <Link href={`/${locale}`}>
            <img
              src="/logo.svg"
              alt="mithrabyte"
              className={styles.logoimg}
            />
          </Link>
        </div>
        <div className={styles.navlinks}>
          <Link className={styles.navlink} href={`/${locale}/packages`} >{t('packages')}</Link>
          <Link className={styles.navlink} href={`/${locale}/services`} >{t('services')}</Link>
          <Link className={styles.navlink} href={`/${locale}/aboutus`} >{t('about')}</Link>
          <Link className={styles.navlink} href={`/${locale}/contact`} >{t('contact')}</Link>
          <LanguageSwitcher />
          <ThemeSwticher/>
        </div>
              <button className={styles.navmenubutton} onClick={() => setMenuOpen(!menuOpen)}  ><Logs/> </button>
      </div>
      <div className={`${styles.emptydiv} ${styles.emptydivright}`} ></div>
    </div>
  )
}

export default Navbar