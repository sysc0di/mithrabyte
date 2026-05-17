"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./homeproductlist.module.css";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';

function ProductsOnHomeCards() {
  const t = useTranslations('home.products');
 

  const contentRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth > 768) return; // sadece mobilde tetikle

    if (!contentRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );


    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div ref={contentRef} className={styles.container}>
        <div
          className={`${styles.card} ${styles.card1} ${
            isVisible ? styles.cardactive : ""
          }`}
        >
          <svg
            className={styles.borderAnim}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="4" ry="2" />
          </svg>
          <span className={styles.cardtitle}>{t('socialMedia.title')}</span>
          <span className={styles.cardtext}>
            {t('socialMedia.description')}
          </span>
          <Link className="cardlink" href="https://bionluk.com/coderingewer">
            {t('socialMedia.cta')}
          </Link>
        </div>
        <div
          className={`${styles.card} ${styles.card2} ${
            isVisible ? styles.cardactive : ""
          }`}
        >
          <svg
            className={styles.borderAnim}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="4" ry="4" />
          </svg>
          <span className={styles.cardtitle}>{t('mobile.title')}</span>
          <span className={styles.cardtext}>
            {t('mobile.description')}
          </span>
          <Link className="cardlink" href="https://bionluk.com/coderingewer">
            {t('mobile.cta')}
          </Link>
        </div>
        <div
          className={`${styles.card} ${styles.card3} ${
            isVisible ? styles.cardactive : ""
          }`}
        >
          <svg
            className={styles.borderAnim}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <rect x="0.25" y="0.25" width="99.5" height="99.5" rx="4" ry="4" />
          </svg>
          <span className={styles.cardtitle}>{t('web.title')}</span>
          <span className={styles.cardtext}>
            {t('web.description')}
          </span>
          <Link className="cardlink" href="https://bionluk.com/coderingewer">
            {t('web.cta')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductsOnHomeCards;
