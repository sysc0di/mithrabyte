"use client";
import Link from "next/link";
import styles from "./packages.module.css";
import { useTranslations } from "next-intl";

export default function Packages() {
  const t = useTranslations("packages");
  const packages = t.raw("packages");

  const PackageCard = ({ title, price, features }) => (
    <div className={styles.card}>
      {/* Sınırları ve köşeleri (rx/ry) kusursuz yakalayan SVG animasyon yapısı */}
      <svg className={styles.borderAnim}>
        <rect rx="16" ry="16" />
      </svg>

      {/* İçeriklerin üst grupta nizami toplanması */}
      <div className={styles.cardTopContent}>
        <h2 className={styles.cardtitle}>{title}</h2>
        <p className={styles.price}>{price}</p>
        <ul className={styles.featureList}>
          {features.map((feat, idx) => (
            <li className={styles.featureItem} key={idx}>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* En alta çıpalanan fütüristik kesik buton */}
      <Link
        target="_blank"
        href="mailto:yatli5645@gmail.com"
        className={styles.cardlink}
      >
        {t("button")}
      </Link>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t("title")}</h1>
        </header>
        
        {/* Masaüstünde tam olarak 2-2 dağılım sağlayan grid alanı */}
        <main className={styles.cardsGrid}>
          {packages.map((pkg, i) => (
            <PackageCard key={i} {...pkg} />
          ))}
        </main>
      </div>
    </div>
  );
}