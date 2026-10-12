import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import Packages from "@/components/Pages/Packages";
import { listPublishedPackages } from "@/lib/services/catalog";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "packages" });
  return {
    title: `${t("title")} | Mithrabyte`,
    description: t("subtitle"),
  };
}

export default async function PackagesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const _packages = await listPublishedPackages({ locale });
  

  return (
    <div className="pagewrapped">
      <Navbar />
      <Packages packages={_packages} />
      <Footer />
    </div>
  );
}
