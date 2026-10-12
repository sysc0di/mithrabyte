import Link from "next/link";
import { useLocale } from "next-intl";

export default function LegalPage({ page }) {
  const locale = useLocale();
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-28">
      <p className="mb-3 text-sm text-muted-foreground">MithraByte · {page.key}</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{page.title}</h1>
      {page.subtitle && <p className="mt-4 text-lg text-muted-foreground">{page.subtitle}</p>}
      <div className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-relaxed">
        {locale === "tr" ? "Bu metin, yayın öncesinde şirket bilgileri doldurularak yetkili hukuk uzmanı tarafından gözden geçirilmelidir."
          : locale === "ku" ? "Divê ev nivîs berî weşanê bi agahiyên şirketê were temamkirin û ji aliyê pisporê hiqûqê ve were venêrîn."
          : "This template must be completed with the company’s details and reviewed by qualified legal counsel before publication."}
      </div>
      <article className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-muted-foreground">
        {page.body}
      </article>
      <p className="mt-10 text-sm"><Link className="text-primary underline" href={`/${locale}/contact`}>Contact MithraByte</Link></p>
    </main>
  );
}
