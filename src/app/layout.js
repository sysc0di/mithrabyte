import "./globals.css";
import Script from "next/script";
import { BoilFilter } from "@oreo-design/doodle-icons";

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
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
      <body suppressHydrationWarning>
        <BoilFilter id="boil" />
        {children}
      </body>
    </html>
  );
}
