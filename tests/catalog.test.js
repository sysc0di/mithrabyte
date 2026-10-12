import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  createProduct,
  deleteCategory,
  deleteProduct,
  ensureUniqueSlug,
  listCategories,
  listProducts,
  updateProduct,
  upsertCategory,
} from "@/lib/services/catalog";

// createCategory is not exported directly — upsertCategory handles both.
function makeCategoryInput(slug = "web-dev") {
  return {
    slug,
    sortOrder: 1,
    isActive: true,
    locales: {
      tr: { title: "Web Geliştirme", description: "Kurumsal web uygulamaları." },
      en: { title: "Web Development", description: "Enterprise web apps." },
    },
  };
}

function makeProductInput(slug = "mithra-chat") {
  return {
    slug,
    status: "AVAILABLE",
    categoryId: null,
    sortOrder: 0,
    locales: {
      tr: { title: "Mithra Chat", tagline: "Yapay zeka destekli sohbet", description: "Uzun açıklama." },
      en: { title: "Mithra Chat", tagline: "AI-powered chat", description: "Long description." },
    },
    features: { tr: ["Hızlı kurulum", "SSL dahil"], en: ["Fast setup", "SSL included"] },
  };
}

describe("catalog service", () => {
  it("creates and lists categories with localized fields", async () => {
    const created = await upsertCategory(makeCategoryInput());
    expect(created.localeFields.tr.title).toBe("Web Geliştirme");

    const list = await listCategories();
    expect(list).toHaveLength(1);
    expect(list[0].localeFields.en.title).toBe("Web Development");
    expect(list[0]._count.products).toBe(0);
  });

  it("rejects duplicate slugs", async () => {
    await upsertCategory(makeCategoryInput("shared"));
    await expect(upsertCategory(makeCategoryInput("shared"))).rejects.toThrow();
  });

  it("updates a category slug via upsert with id, keeping locales in sync", async () => {
    const created = await upsertCategory(makeCategoryInput("old-slug"));
    const updated = await upsertCategory(
      { ...makeCategoryInput("new-slug") },
      { id: created.id }
    );
    expect(updated.slug).toBe("new-slug");
    expect(updated.localeFields.tr.title).toBe("Web Geliştirme");
  });

  it("deletes a category", async () => {
    const created = await upsertCategory(makeCategoryInput());
    await deleteCategory(created.id);
    expect(await listCategories()).toHaveLength(0);
  });

  it("creates a product with features and lists it", async () => {
    const cat = await upsertCategory(makeCategoryInput());
    const product = await createProduct(makeProductInput());
    await prisma.product.update({ where: { id: product.id }, data: { categoryId: cat.id } });

    const { items } = await listProducts({ page: 1, pageSize: 10 });
    expect(items).toHaveLength(1);
    expect(items[0].featureList.tr).toEqual(["Hızlı kurulum", "SSL dahil"]);
  });

  it("replaces features on update", async () => {
    const product = await createProduct(makeProductInput());
    const updated = await updateProduct(product.id, {
      ...makeProductInput(),
      features: { tr: ["Yalnızca yeni", "İkinci"], en: ["Only new", "Second"] },
    });
    expect(updated.featureList.tr).toEqual(["Yalnızca yeni", "İkinci"]);
    expect(updated.featureList.en).toEqual(["Only new", "Second"]);
  });

  it("deletes a product", async () => {
    const product = await createProduct(makeProductInput());
    await deleteProduct(product.id);
    expect(await prisma.product.count()).toBe(0);
  });

  it("ensureUniqueSlug flags conflicts", async () => {
    await createProduct(makeProductInput("taken"));
    await expect(ensureUniqueSlug("product", "taken")).rejects.toMatchObject({ status: 409 });
    await expect(ensureUniqueSlug("product", "fresh", { excludeId: "whatever" })).resolves.toBeUndefined();
  });
});