import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import PackageDetail from "@/components/Pages/PackageDetail";

const locales = ["tr", "en"];
const slugs = [
  "ai-mobile-app",
  "ai-web-platforms",
  "data-analytics-dashboards",
  "cli-developer-tools",
];

export function generateStaticParams() {
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "packages" });
  const pkg = t.raw("packages").find((p) => p.slug === slug);

  if (!pkg) return {};

  return {
    title: `${pkg.title} | Mithrabyte`,
    description: pkg.description,
  };
}

export default async function PackageDetailPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!slugs.includes(slug)) {
    notFound();
  }

  return (
    <div className="pagewrapped">
      <Navbar />
      <PackageDetail slug={slug} />
      <Footer />
    </div>
  );
}
