import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import PackageDetail from "@/components/Pages/PackageDetail";
import { getPublishedPackageBySlug, listPublishedPackages } from "@/lib/services/catalog";
import { SUPPORTED_LOCALES } from "@/lib/constants";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const packages = await listPublishedPackages({});
    return SUPPORTED_LOCALES.flatMap((locale) =>
      packages.map((pkg) => ({ locale, slug: pkg.slug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const pkg = await getPublishedPackageBySlug(slug, { locale }).catch(() => null);
  if (!pkg) return {};
  return {
    title: pkg.seoTitle || `${pkg.title} | Mithrabyte`,
    description: pkg.seoDescription || pkg.tagline || pkg.description,
  };
}

export default async function PackageDetailPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const pkg = await getPublishedPackageBySlug(slug, { locale }).catch(() => null);
  if (!pkg) {
    notFound();
  }

  return (
    <div className="pagewrapped">
      <Navbar />
      <PackageDetail pkg={pkg} />
      <Footer />
    </div>
  );
}
