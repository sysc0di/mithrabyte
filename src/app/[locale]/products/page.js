import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import Products from "@/components/Pages/Products";
import { listPublishedProducts } from "@/lib/services/catalog";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsPage" });
  return {
    title: `${t("title")} | Mithrabyte`,
    description: t("subtitle"),
  };
}

export default async function ProductsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const _products = await listPublishedProducts({ locale });
  

  return (
    <div className="pagewrapped">
      <Navbar />
      <Products products={_products} />
      <Footer />
    </div>
  );
}
