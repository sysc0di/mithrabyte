import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

const locales = ['tr', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isTurkish = locale === 'tr';
  
  return {
    title: isTurkish 
      ? "Mithrabyte | Yapay Zeka Destekli Çözümler"
      : "Mithrabyte | AI-Powered Solutions",
    description: isTurkish
      ? "Yapay zeka destekli mobil ve web uygulamalarıyla işinizi büyütün."
      : "Grow your business with AI-powered mobile and web applications.",
    keywords: [
      "yapay zeka",
      "mobil uygulama",
      "web geliştirme",
      "yönetim panelleri",
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
      canonical: "https://mithrabyte.com/",
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
      title: isTurkish
        ? "Mithrabyte | Yapay Zeka Destekli Çözümler"
        : "Mithrabyte | AI-Powered Solutions",
      description: isTurkish
        ? "Yapay zeka destekli mobil ve web uygulamalarıyla işinizi büyütün."
        : "Grow your business with AI-powered mobile and web applications.",
      url: "https://mithrabyte.com/",
      siteName: "Mithrabyte",
      images: [
        {
          url: "https://mithrabyte.com/og-image.png",
          width: 1200,
          height: 630,
          alt: isTurkish
            ? "Mithrabyte - Yapay Zeka Destekli Çözümler"
            : "Mithrabyte - AI-Powered Solutions",
        },
      ],
      locale: locale === 'tr' ? "tr_TR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isTurkish
        ? "Mithrabyte | Yapay Zeka Destekli Çözümler"
        : "Mithrabyte | AI-Powered Solutions",
      description: isTurkish
        ? "Yapay zeka destekli mobil ve web uygulamalarıyla işinizi büyütün."
        : "Grow your business with AI-powered mobile and web applications.",
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
    <NextIntlClientProvider messages={messages}>
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

