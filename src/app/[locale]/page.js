import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar/Navbar";
import styles from "../page.module.css";
import HomeContent from "@/components/Home/HomeContent";
import Footer from "@/components/Footer/Footer";
import { listPublishedProducts, listPublishedPackages } from "@/lib/services/catalog";

export const revalidate = 300;

export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let products = [];
  let packages = [];
  try {
    [products, packages] = await Promise.all([
      listPublishedProducts({ locale }),
      listPublishedPackages({ locale }),
    ]);
  } catch {
    // Fall back to an empty catalog rather than failing the whole page.
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <HomeContent products={products} packages={packages} />
      <Footer />
    </div>
  );
}
