"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./companycards.module.css";
import { useTranslations } from 'next-intl';

function CompanyCards() {
  const t = useTranslations('home.company');
  const contentRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth > 768) return;

    if (!contentRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, []);

  const companyInfo = [
    {
      title: t('card1.title'),
      description: t('card1.description'),
      icon: t('card1.icon'),
      className: styles.card1
    },
    {
      title: t('card2.title'),
      description: t('card2.description'),
      icon: t('card2.icon'),
      className: styles.card2
    },
    {
      title: t('card3.title'),
      description: t('card3.description'),
      icon: t('card3.icon'),
      className: styles.card3
    },
    {
      title: t('card4.title'),
      description: t('card4.description'),
      icon: t('card4.icon'),
      className: styles.card4
    }
  ];

  return (
    <div className={styles.wrapper}>
      <div ref={contentRef} className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('title')}</h2>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>
        <div className={styles.cardsGrid}>
          {companyInfo.map((info, index) => (
            <div
              key={index}
              className={`${styles.card} ${info.className} ${
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
              <div className={styles.iconContainer}>
                <span className={styles.icon}>{info.icon}</span>
              </div>
              <span className={styles.cardtitle}>{info.title}</span>
              <span className={styles.cardtext}>{info.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CompanyCards;

