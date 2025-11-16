"use client";
import styles from './sidebarmenu.module.css';
import {  Instagram, Github } from 'lucide-react';
import ThemeSwticher from './ThemeSwticher';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function SidebarMenu({ open, onClose }) {
    const t = useTranslations('nav');
    const locale = useLocale();
    const links = [
        { href: `/${locale}`, label: locale === 'tr' ? 'Ana Sayfa' : 'Home' },
        { href: `/${locale}/aboutus`, label: t('about') },
        { href: `/${locale}/packages`, label: t('packages') },
        { href: `/${locale}/services`, label: t('services') },
        { href: `/${locale}/contact`, label: t('contact') },
    ];

    const socialLinks = [
        { href: 'https://instagram.com/mithrabyte', icon: <Instagram className={styles.socialIcon} />, label: 'Instagram' },
        { href: 'https://github.com/sysc0di', icon: <Github className={styles.socialIcon} />, label: 'Github' },
    ];

    return (
        <>
            <nav className={`${styles.sidebar} ${open ? styles.open : ''}`}>
                <ul>
                    {links.map(({ href, label }) => (
                        <li key={href}>
                            <Link href={href} onClick={onClose}>{label}</Link>
                        </li>
                    ))}
                </ul>

                <div className={styles.socialContainer}>
                    {socialLinks.map(({ href, icon, label }) => (
                        <a
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className={styles.socialLink}
                            onClick={onClose}
                        >
                            {icon}
                        </a>
                    ))}
                    <LanguageSwitcher />
                    <ThemeSwticher/>
                </div>
            </nav>

            {open && <div className={styles.overlay} onClick={onClose}></div>}
        </>
    );
}
