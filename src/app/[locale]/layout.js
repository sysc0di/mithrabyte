import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import SiteBackground from '@/components/SiteBackground';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const locales = ['tr', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const copy = locale === 'tr'
    ? { title: "MithraByte | Gizlilik Odaklı Yerel Yapay Zeka", description: "Veri kontrolünü işletmenizde tutan yerel yapay zeka, özel otomasyon ve e-ticaret altyapısı." }
    : { title: "MithraByte | Private, Local AI Systems", description: "Local AI, private assistants, business automation, and e-commerce infrastructure built around your control of data." };

  return {
    title: copy.title,
    description: copy.description,
    keywords: [
      "yapay zeka",
      "yerel yapay zeka", "self-hosted AI", "private AI", "business automation",
      "e-commerce infrastructure", "özel yazılım geliştirme",
      "AI",
      "Next.js",
      "veri analizi",
      "mithrabyte",
      "mithra byte",
      "mithra",
      "Mithra Byte",
    ],
    metadataBase: new URL("https://mithrabyte.com/"),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    alternates: {
      canonical: `https://mithrabyte.com/${locale}`,
      languages: { tr: "/tr", en: "/en", "x-default": "/tr" },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: copy.title, description: copy.description, url: `https://mithrabyte.com/${locale}`,
      siteName: "Mithrabyte",
      images: [
        {
          url: "https://mithrabyte.com/og-image.png",
          width: 1200,
          height: 630,
          alt: copy.title,
        },
      ],
      locale: locale === 'tr' ? "tr_TR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title, description: copy.description,
      images: ["https://mithrabyte.com/og-image.jpg"],
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Explicitly pass locale to getMessages to ensure it's available
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SiteBackground />
      <AnalyticsTracker />
      <Script
        id="set-lang-attribute"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = '${locale}';`,
        }}
      />
      {children}
    </NextIntlClientProvider>
  );
}
