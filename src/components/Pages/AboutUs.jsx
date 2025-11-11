"use client";
import React from "react";
import styles from "./aboutus.module.css";
import { Users, Rocket, Target } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AboutUs() {
  const t = useTranslations("aboutus");

  return (
    <div className={styles.aboutContainer}>
      {/* Hakkımızda / About */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("title")}</h2>
        <p className={styles.sectionText}>{t("description")}</p>
      </div>

      {/* Değerlerimiz / Our Values */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("values.title")}</h2>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <Users className={styles.icon} />
            <h3>{t("values.collaboration.title")}</h3>
            <p className={styles.sectionText}>
              {t("values.collaboration.description")}
            </p>
          </div>

          <div className={styles.featureCard}>
            <Rocket className={styles.icon} />
            <h3>{t("values.innovation.title")}</h3>
            <p className={styles.sectionText}>
              {t("values.innovation.description")}
            </p>
          </div>

          <div className={styles.featureCard}>
            <Target className={styles.icon} />
            <h3>{t("values.focus.title")}</h3>
            <p className={styles.sectionText}>
              {t("values.focus.description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
