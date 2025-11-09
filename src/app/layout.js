import "./globals.css";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LP24PHV0M0"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LP24PHV0M0');
            `,
          }}
        />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Mithrabyte",
              url: "https://mithrabyte.com/",
              logo: "https://mithrabyte.com/logo.png",
              sameAs: [
                "https://www.linkedin.com/company/mithrabyte",
                "https://twitter.com/mithrabyte",
              ],
            }),
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
