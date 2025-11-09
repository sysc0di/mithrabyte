"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./whyus.module.css";
import Link from "next/link";
import { useTranslations } from 'next-intl';

function WhyUs() {
  const t = useTranslations('home.whyUs');
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

    observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.whyuscontainer}>
      <div
        ref={contentRef}
        className={`${styles.whyuscontent} ${isVisible ? styles.active : ""}`}
      >
        <div
          className={`${styles.whyustexts} ${isVisible ? styles.whyustextsopacityactive : ""}`}
        >
          <h1>{t('title')}</h1>
          <p>
            {t('description')}
          </p>
        <Link className="cardlink" target="_blank" href="https://bionluk.com/coderingewer">{t('cta')}</Link>
        </div>
      </div>
    </div>
  );
}

export default WhyUs;
