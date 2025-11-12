"use client";
import Link from "next/link";
import styles from "./packages.module.css";
import stylesh from "../Home/pricinglistathome.module.css";
import { useTranslations } from "next-intl";

export default function Packages() {
  const t = useTranslations("packages");
  const packages = t.raw("packages");

  const PackageCard = ({ title, price, features }) => (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.price}>{price}</p>
      <ul className={styles.featureList}>
        {features.map((feat, idx) => (
          <li className={styles.featureItem} key={idx}>{feat}</li>
        ))}
      </ul>
      <Link
        target="_blank"
        href="https://bionluk.com/coderingewer"
        className={stylesh.button}
      >
        {t("button")}
      </Link>
    </div>
  );

  return (
    <div className={styles.packagescontainer}>
      <h1 className={styles.pageTitle}>{t("title")}</h1>
      <main className={styles.packageslist}>
        {packages.map((pkg, i) => (
          <PackageCard key={i} {...pkg} />
        ))}
      </main>
    </div>
  );
}
