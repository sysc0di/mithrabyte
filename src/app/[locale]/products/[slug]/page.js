import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import ProductDetail from "@/components/Pages/ProductDetail";
import { getPublishedProductBySlug, listPublishedProducts } from "@/lib/services/catalog";
import { SUPPORTED_LOCALES } from "@/lib/constants";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await listPublishedProducts({});
    return SUPPORTED_LOCALES.flatMap((locale) =>
      products.map((product) => ({ locale, slug: product.slug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const product = await getPublishedProductBySlug(slug, { locale }).catch(() => null);
  if (!product) return {};
  return {
    title: product.seoTitle || `${product.title} | Mithrabyte`,
    description: product.seoDescription || product.shortDescription || product.tagline,
  };
}

export default async function ProductDetailPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getPublishedProductBySlug(slug, { locale }).catch(() => null);
  if (!product) {
    notFound();
  }

  return (
    <div className="pagewrapped">
      <Navbar />
      <ProductDetail product={product} />
      <Footer />
    </div>
  );
}
