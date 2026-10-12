"use client";

import styles from "./footer.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../Navbar/LanguageSwitcher";
import { useIsMobile } from "@/lib/hooks/useReducedMotion";

export default function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname() || "";
  const firstSegment = pathname.split("/")[1];
  const locale = ["tr", "en"].includes(firstSegment) ? firstSegment : "en";
  const isMobile = useIsMobile();

  const columns = [
    {
      title: t("explore"),
      links: [
        { href: `/${locale}`, label: t("home") },
        { href: `/${locale}/packages`, label: t("packages") },
        { href: `/${locale}/services`, label: t("services") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: `/${locale}/aboutus`, label: t("about") },
        { href: `/${locale}/contact`, label: t("contact") },
      ],
    },
    {
      title: t("legal"),
      links: [
        { href: `/${locale}/legal/privacy-policy`, label: t("privacy") },
        { href: `/${locale}/legal/kvkk-information-notice`, label: t("kvkk") },
        { href: `/${locale}/legal/cookie-policy`, label: t("cookies") },
        { href: `/${locale}/legal/terms-of-use`, label: t("terms") },
      ],
    },
    {
      title: t("elsewhere"),
      links: [
        { href: "https://instagram.com/mithrabyteai", label: "Instagram", external: true },
        { href: "mailto:contact@mithrabyte.com", label: "e-mail", external: true },
      ],
    },
  ];

  return (
    <footer className={styles.foot} data-kage-footer="">
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        {/* Logo + wordmark */}
        <div className={styles.footertop}>
          <img src="/logo.svg" alt="mithrabyte" className={styles.footerlogo} />
          <span className={styles.wordmark}>Mithrabyte</span>
        </div>

        <hr className={styles.divider} />

        {/* Two-column layout: links left, contact CTA right */}
        <div className={styles.columnsWrap}>
          {/* Links: tek grid, sığmayan sütunlar alt satıra geçer */}
          <div className={styles.footerlinks}>
            <div className={styles.linksColumn}>
              {columns.map((col) => (
                <div className={styles.column} key={col.title}>
                  <h4>{col.title}</h4>
                  <ul>
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noreferrer" : undefined}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA - simplified on mobile */}
          <div className={styles.ctaColumn}>
            <div className={`${styles.ctaCard} ${isMobile ? styles.ctaCardMobile : ""}`}>
              <h3>{t("contactCtaTitle")}</h3>
              <p>{t("contactCtaDesc")}</p>

              <Link href={`/${locale}/contact`} className={styles.ctaButton}>
                {t("contactCtaButton")}
              </Link>

              {!isMobile && (
                <div className={styles.ctaMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{t("emailLabel")}</span>
                    <a href="mailto:contact@mithrabyte.com" className={styles.metaValue}>
                      contact@mithrabyte.com
                    </a>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{t("phoneLabel")}</span>
                    <a href="tel:+905058044818" className={styles.metaValue}>
                      +90 505 804 4818
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Base: copyright, baseline, language switcher */}
        <div className={styles.base}>
          <span className={styles.copyright}>
            © {new Date().getFullYear()} {t("copyright")}
          </span>
          <span className={styles.baseline}>{t("baseline")}</span>
          <div className={styles.switchers}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}