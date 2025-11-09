"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./jobscards.module.css";
import Link from "next/link";
import { useTranslations } from 'next-intl';

function JobsCards() {
  const t = useTranslations('home.jobs');
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

  const jobs = [
    {
      title: t('card1.title'),
      description: t('card1.description'),
      cta: t('card1.cta'),
      className: styles.card1
    },
    {
      title: t('card2.title'),
      description: t('card2.description'),
      cta: t('card2.cta'),
      className: styles.card2
    },
    {
      title: t('card3.title'),
      description: t('card3.description'),
      cta: t('card3.cta'),
      className: styles.card3
    },
    {
      title: t('card4.title'),
      description: t('card4.description'),
      cta: t('card4.cta'),
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
          {jobs.map((job, index) => (
            <div
              key={index}
              className={`${styles.card} ${job.className} ${
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
              <span className={styles.cardtitle}>{job.title}</span>
              <span className={styles.cardtext}>{job.description}</span>
              <Link className={styles.cardlink} href="https://bionluk.com/coderingewer" target="_blank">
                {job.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JobsCards;

