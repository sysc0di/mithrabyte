import { NextResponse } from "next/server";
import { listPublishedProducts, listPublishedPackages } from "@/lib/services/catalog";
import { SUPPORTED_LOCALES } from "@/lib/constants";

export const revalidate = 3600;

const baseUrl = "https://mithrabyte.com";

const staticPaths = ["", "services", "packages", "products", "aboutus", "contact", "legal/privacy-policy", "legal/kvkk-information-notice", "legal/cookie-policy", "legal/terms-of-use", "legal/intellectual-property"];

function alternates(path) {
  return SUPPORTED_LOCALES.map(
    (locale) =>
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${baseUrl}/${locale}/${path}" />`
  ).join("\n");
}

function urlEntry(path, { priority = "0.8", changefreq = "weekly" } = {}) {
  return SUPPORTED_LOCALES.map(
    (locale) => `
  <url>
    <loc>${baseUrl}/${locale}/${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates(path)}
  </url>`
  ).join("");
}

async function dynamicEntries() {
  const paths = [];
  try {
    const [products, packages] = await Promise.all([
      listPublishedProducts({}),
      listPublishedPackages({}),
    ]);
    for (const product of products) paths.push(`products/${product.slug}`);
    for (const pkg of packages) paths.push(`packages/${pkg.slug}`);
  } catch {
    // Sitemap still serves static routes if the catalog is unavailable.
  }
  return paths.map((path) => urlEntry(path, { priority: "0.7" })).join("");
}

export async function GET() {
  const staticEntries = staticPaths.map((path) => urlEntry(path)).join("");
  const dynamic = await dynamicEntries();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${staticEntries}${dynamic}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
