"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DoodleIcon } from "@oreo-design/doodle-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const items = [
  { key: "socialMedia", icon: "share" },
  { key: "mobile", icon: "phone" },
  { key: "web", icon: "browser" },
];

function ProductsOnHomeCards() {
  const t = useTranslations("home.products");

  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-5 md:grid-cols-3">
        {items.map(({ key, icon }) => (
          <Card key={key} className="flex flex-col">
            <CardHeader>
              <span className="mb-2 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <DoodleIcon name={icon} boilId="boil" size={22} />
              </span>
              <CardTitle>{t(`${key}.title`)}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{t(`${key}.description`)}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="mailto:yatli5645@gmail.com">
                  {t(`${key}.cta`)}
                  <DoodleIcon name="arrow-right" boilId="boil" size={16} />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default ProductsOnHomeCards;
