"use client";
import styles from "./homecontent.module.css"
import Link from 'next/link'
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import ProductsOnHomeCards from "./ProductsOnHomeCards";
import SolutionsSection from "./SolutionsSection";
import TerminalSection from "./TerminalSection";
import StatsSection from "./StatsSection";
import WhyUs from "./WhyUs";
import PricingListAthome from "./PricingListAthome";
import JobsCards from "./JobsCards";
import CompanyCards from "./CompanyCards";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from 'next-intl';

// SSR hatalarını önlemek için Canvas içeriğini dinamik yükle
const Model = dynamic(() => import("../Models/HomeModel"), { ssr: false });
const BrandWordmark = dynamic(() => import("../../effects/tech-text/TechText"), { ssr: false });
const BrandSlogan = dynamic(() => import("../../effects/text-type/TextType"), { ssr: false });

function HomeContent() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <div className={styles.homecontentcontainer} >
      <div className={styles.homebanner}>
        <Model />
        <div className={styles.herotint} aria-hidden="true" />
        <div className={styles.bannercontentcontainer}>
          <div className={styles.techword}>
            <BrandWordmark
              text="Mithrabyte"
              fontSize={150}
              color="#D3D5FD"
              accentColor="#927FBF"
              reach={220}
              softness={0.7}
              specks={18}
              speed={0.9}
            />
          </div>
          <div className={styles.homecardtexts} >
            <BrandSlogan
              text={t('slogan')}
              typingSpeed={55}
              deletingSpeed={24}
              initialDelay={500}
              pauseDuration={2800}
              loop
              showCursor
              cursorCharacter="|"
              className={styles.slogan}
            />
            <div className={styles.buttongridcard}>
              <Button asChild size="lg">
                <Link href={`/${locale}/packages`}>{t('packages')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ProductsOnHomeCards />
      <SolutionsSection />
      <TerminalSection />
      <StatsSection />
      <JobsCards />
      <CompanyCards />
      <PricingListAthome/>
    </div>
  )
}

export default HomeContent