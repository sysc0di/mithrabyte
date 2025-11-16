"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./companycards.module.css";
import { useTranslations } from 'next-intl';
import { Code, Cpu, Globe, Users } from "lucide-react";


function CompanyCards() {
  const t = useTranslations('home.company');
  const contentRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const icons = [<Cpu key="cpu" className={styles.icon} />, <Code key="code" className={styles.icon} />, <Globe key="globe" className={styles.icon} />, <Users key="users" className={styles.icon} />];

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
      icon:icons[0],
      className: styles.card1
    },
    {
      title: t('card2.title'),
      description: t('card2.description'),
      icon: icons[1],
      className: styles.card2
    },
    {
      title: t('card3.title'),
      description: t('card3.description'),
      icon: icons[2],
      className: styles.card3
    },
    {
      title: t('card4.title'),
      description: t('card4.description'),
      icon: icons[3],
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

