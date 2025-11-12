"use client";
import styles from "./services.module.css";
import { Cpu, Code, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Services() {
  const t = useTranslations("services");
  const services = t.raw("services"); // JSON içindeki array'i direkt alıyoruz

  const icons = [<Cpu key="cpu" className={styles.icon} />, <Code key="code" className={styles.icon} />, <Globe key="globe" className={styles.icon} />];

  return (
    <main className={styles.servicesContainer}>
      <h1 className={styles.title}>{t("title")}</h1>

      <section className={styles.servicesList}>
        {services.map((service, i) => (
          <article key={i} className={styles.serviceCard}>
            {icons[i]}
            <h2 className={styles.serviceTitle}>{service.title}</h2>
            <p className={styles.serviceDesc}>{service.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
