"use client";
import styles from "./homecontent.module.css"
import Link from 'next/link'
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import TextSlider from "./TextFade";
import ProductsOnHomeCards from "./ProductsOnHomeCards";
import WhyUs from "./WhyUs";
import PricingListAthome from "./PricingListAthome";
import JobsCards from "./JobsCards";
import CompanyCards from "./CompanyCards";
import { useTranslations, useLocale } from 'next-intl';

// SSR hatalarını önlemek için Canvas içeriğini dinamik yükle
const Model = dynamic(() => import("../Models/HomeModel"), { ssr: false });

function HomeContent() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <div className={styles.homecontentcontainer} >
      <div className={styles.homebanner}>
        <div className={styles.bannercontentcontainer}>
          <div className={styles.homecardright} >
            <div className={styles.homecardtexts} >
              <span className={styles.homebannertitle}>
                {t('title')}
              </span>
              <TextSlider />
              <Link href={`/${locale}/packages`} className={` ${styles.cardlink} ${styles.linecardlink}`}>{t('packages')}</Link>
            </div>
            <div className={styles.bannerlistview} >
              <Model />
            </div>
          </div>
        </div>
      </div>
      <ProductsOnHomeCards />
      <WhyUs/>
      <JobsCards />
      <CompanyCards />
      <PricingListAthome/>
    </div>
  )
}

export default HomeContent