import React from "react";
import styles from "./pricinglistathome.module.css";
import Link from "next/link";
import { useTranslations } from "next-intl";

function PricingListAthome() {
  const t = useTranslations("home.pricing");

  // packages array is fetched dynamically from translation JSON
  const packages = t.raw("packages");

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.subtitle}>{t("subtitle")}</p>

      <div className={styles.cardContainer}>
        {packages.map((pkg, i) => (
          <div key={i} className={styles.card}>
            <h2 className={styles.cardTitle}>{pkg.title}</h2>
            <p className={styles.cardDesc}>{pkg.description}</p>
            <ul className={styles.featureList}>
              {pkg.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            <div className={styles.pricecontainer}>
              <div className={styles.price}>{pkg.price}</div>
              <Link
                target="_blank"
                href={pkg.url}
                className={styles.button}
              >
                {t("cta", { default: "Get Quote" })}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default PricingListAthome;
