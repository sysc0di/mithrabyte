'use client';

import { useEffect, useState } from "react";
import styles from './textfade.module.css';
import { useTranslations } from 'next-intl';

export default function TextSlider() {
  const t = useTranslations('home.textSlider');
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);

  const texts = [
    t('text1'),
    t('text2'),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setAnimate(false);
      }, 500); // animasyon süresi kadar bekle
    }, 5000);

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className={styles.container}>
      <div className={`${styles.text} ${animate ? styles.slideUp : ""}`}>
        {texts[index]}
      </div>
    </div>
  );
}
