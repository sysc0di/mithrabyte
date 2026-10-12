import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import LegalPage from "@/components/Pages/LegalPage";
import { getPublishedPageByKey } from "@/lib/services/content";
import { legalFallback } from "@/lib/legal-fallbacks";

const slugs = ["privacy-policy", "kvkk-information-notice", "cookie-policy", "terms-of-use", "intellectual-property"];
export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const page = await getPublishedPageByKey(`legal.${slug}`, locale).catch(() => null) || legalFallback(slug, locale);
  return page ? { title: page.seoTitle || `${page.title} | MithraByte`, description: page.seoDescription || page.subtitle, robots: { index: true, follow: true }, alternates: { canonical: `/${locale}/legal/${slug}` } } : {};
}

export default async function PublicLegalPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!slugs.includes(slug)) notFound();
  const page = await getPublishedPageByKey(`legal.${slug}`, locale).catch(() => null) || legalFallback(slug, locale);
  if (!page) notFound();
  return <div className="pagewrapped"><Navbar /><LegalPage page={page} /><Footer /></div>;
}
