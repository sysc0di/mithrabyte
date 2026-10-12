"use client";
import styles from "./footer.module.css";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../Navbar/LanguageSwitcher";

const SignalParticles = dynamic(
  () =>
    import("@/effects/neuform-isolated/NeuformBatchEffects").then(
      (mod) => mod.SignalParticles
    ),
  { ssr: false }
);

export default function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname() || "";
  const firstSegment = pathname.split("/")[1];
  const locale = ["tr", "en"].includes(firstSegment) ? firstSegment : "en";

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
        { href: "https://instagram.com/mithrabyte", label: "Instagram", external: true },
        { href: "https://github.com/sysc0di", label: "GitHub", external: true },
        { href: "https://www.linkedin.com/company/mithrabyte", label: "LinkedIn", external: true },
        { href: "https://twitter.com/mithrabyte", label: "X / Twitter", external: true },
      ],
    },
  ];

  return (
    <footer className={styles.foot} data-kage-footer="">
      <div className={styles.fg} aria-hidden="true">
        <span className={`${styles.fgEl} ${styles.fgBush}`}>
        </span>
        <span className={`${styles.fgEl} ${styles.fgGrass}`}>
        </span>
        <span className={`${styles.fgEl} ${styles.fgStones}`}>
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <Image src="/logo.svg" alt="Mithrabyte" width={512} height={512} />
          </span>
          <p>{t("tagline")}</p>
        </div>

        {columns.map((column) => (
          <div className={styles.col} key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((link) => (
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

      <div className={styles.base}>
        <span>
          © {new Date().getFullYear()} {t("copyright")}
        </span>
        <span>{t("baseline")}</span>
        <div className={styles.switchers}>
          <LanguageSwitcher />
        </div>
      </div>

      <div className={styles.bg} aria-hidden="true">
        <SignalParticles mode="dark" />
      </div>
    </footer>
  );
}
