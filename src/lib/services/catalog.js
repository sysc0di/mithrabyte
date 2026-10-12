import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { SUPPORTED_LOCALES } from "@/lib/constants";

/**
 * Catalog domain logic: categories, products, service packages & maintenance
 * plans. All localized content uses the enabled locale set.
 */

export function normalizeLocaleField(field) {
  if (!field) return undefined;
  const out = {};
  for (const locale of Object.keys(field)) {
    if (!SUPPORTED_LOCALES.includes(locale)) continue;
    const value = field[locale];
    if (value === undefined || value === null) continue;
    out[locale] = value;
  }
  return Object.keys(out).length ? out : undefined;
}

function localeDataOf(row) {
  return (row?.locales || []).reduce((acc, item) => {
    const { locale, ...rest } = item;
    acc[locale] = rest;
    return acc;
  }, {});
}

export function localeList(row) {
  return localeDataOf(row);
}

/**
 * Converts a per-locale feature list into Prisma nested-create payloads,
 * aligning items by index across locales.
 */
export function featuresToCreate(features) {
  if (!features) return undefined;
  const normalized = normalizeLocaleField(features);
  if (!normalized) return undefined;

  const byIndex = new Map();
  for (const [locale, list] of Object.entries(normalized)) {
    (list || []).forEach((text, index) => {
      if (!text) return;
      if (!byIndex.has(index)) byIndex.set(index, []);
      byIndex.get(index).push({ locale, text });
    });
  }

  return [...byIndex.entries()]
    .sort(([a], [b]) => a - b)
    .map(([index, items]) => ({
      sortOrder: index,
      locales: { create: items },
    }));
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function listCategories() {
  const items = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      locales: true,
      _count: { select: { products: true } },
    },
  });
  return items.map((item) => ({ ...item, localeFields: localeList(item) }));
}

export async function upsertCategory(input, { id } = {}) {
  if (id) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Category not found.");

    const { locales, ...rest } = input;
    await prisma.$transaction(async (tx) => {
      await tx.category.update({ where: { id }, data: rest });
      for (const locale of SUPPORTED_LOCALES) {
        const content = locales?.[locale];
        if (!content) continue;
        await tx.categoryLocale.upsert({
          where: { categoryId_locale: { categoryId: id, locale } },
          update: content,
          create: { categoryId: id, locale, ...content },
        });
      }
    });
    return getCategory(id);
  }

  let createdId;
  await prisma.$transaction(async (tx) => {
    const created = await tx.category.create({ data: { ...input, locales: { create: [] } } });
    createdId = created.id;
    for (const locale of SUPPORTED_LOCALES) {
      const content = input.locales?.[locale];
      if (!content) continue;
      await tx.categoryLocale.create({
        data: { categoryId: created.id, locale, ...content },
      });
    }
  });
  return getCategory(createdId);
}

export async function deleteCategory(id) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Category not found.");
  await prisma.category.delete({ where: { id } });
  return true;
}

export async function getCategory(id) {
  const item = await prisma.category.findUnique({
    where: { id },
    include: { locales: true, _count: { select: { products: true } } },
  });
  if (!item) throw new ApiError(404, "NOT_FOUND", "Category not found.");
  return { ...item, localeFields: localeList(item) };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const productInclude = () => ({
  locales: true,
  features: { orderBy: { sortOrder: "asc" }, include: { locales: true } },
  category: { include: { locales: true } },
});

export async function listProducts({ page, pageSize, skip, take, status, categoryId, search } = {}) {
  const where = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { slug: { contains: search, mode: "insensitive" } },
      { locales: { some: { title: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productInclude(),
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  const mapped = items.map((item) => ({
    ...item,
    localeFields: localeList(item),
    featureList: localeListOfFeatures(item),
  }));
  return { items: mapped, total, page, pageSize };
}

function localeListOfFeatures(item) {
  const out = {};
  for (const feature of item.features) {
    for (const locale of feature.locales) {
      if (!out[locale.locale]) out[locale.locale] = [];
      out[locale.locale].push(locale.text);
    }
  }
  return out;
}

export async function getProduct(id) {
  const item = await prisma.product.findUnique({ where: { id }, include: productInclude() });
  if (!item) throw new ApiError(404, "NOT_FOUND", "Product not found.");
  return {
    ...item,
    localeFields: localeList(item),
    featureList: localeListOfFeatures(item),
    categorySlug: item.category?.slug ?? null,
  };
}

export async function createProduct(input) {
  const { features, locales, ...rest } = input;
  const created = await prisma.product.create({
    data: {
      ...rest,
      locales: { create: Object.entries(locales || {}).map(([locale, content]) => ({ locale, ...content })) },
      features: { create: featuresToCreate(features) },
    },
  });
  return getProduct(created.id);
}

export async function updateProduct(id, input) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Product not found.");

  const { features, locales, ...rest } = input;
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: rest });

    // Synchronize locales, preserving rows that were not submitted.
    const submitted = Object.keys(locales || {});
    await tx.productLocale.deleteMany({ where: { productId: id, locale: { notIn: submitted } } });
    for (const locale of submitted) {
      const content = locales[locale];
      await tx.productLocale.upsert({
        where: { productId_locale: { productId: id, locale } },
        update: content,
        create: { productId: id, locale, ...content },
      });
    }

    if (features) {
      await replaceFeatures(tx, "productFeature", "productId", id, features);
    }
  });

  return getProduct(id);
}

/**
 * Creates feature rows for a parent (product/package) from localized lists.
 * Kept as a plain helper so both product and package services can share it.
 */
export async function replaceFeatures(tx, featureModel, parentField, parentId, features) {
  if (!features) return;
  await tx[featureModel].deleteMany({ where: { [parentField]: parentId } });
  const rows = featuresToCreate(features) || [];
  for (const row of rows) {
    await tx[featureModel].create({
      data: { [parentField]: parentId, sortOrder: row.sortOrder, locales: row.locales },
    });
  }
}

export async function deleteProduct(id) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Product not found.");
  await prisma.product.delete({ where: { id } });
  return true;
}

// ---------------------------------------------------------------------------
// Service packages & maintenance plans
// ---------------------------------------------------------------------------

function normalizePackageFields(input) {
  const out = { ...input };
  if (out.currency === "") out.currency = null;
  if (out.priceAmount === undefined) delete out.priceAmount;
  return out;
}

export async function listPackages({ kind, status, productId, page, pageSize, skip, take, search } = {}) {
  const where = {};
  if (kind) where.kind = kind;
  if (status) where.status = status;
  if (productId) where.productId = productId;
  if (search) {
    where.OR = [
      { slug: { contains: search, mode: "insensitive" } },
      { locales: { some: { title: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.servicePackage.findMany({
      where,
      include: {
        locales: true,
        features: { orderBy: { sortOrder: "asc" }, include: { locales: true } },
        product: { include: { locales: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.servicePackage.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      localeFields: localeList(item),
      featureList: localeListOfFeatures(item),
      productSlug: item.product?.slug ?? null,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getPackage(id) {
  const item = await prisma.servicePackage.findUnique({
    where: { id },
    include: {
      locales: true,
      features: { orderBy: { sortOrder: "asc" }, include: { locales: true } },
      product: { include: { locales: true } },
    },
  });
  if (!item) throw new ApiError(404, "NOT_FOUND", "Package not found.");
  return {
    ...item,
    localeFields: localeList(item),
    featureList: localeListOfFeatures(item),
    productSlug: item.product?.slug ?? null,
  };
}

export async function createPackage(input) {
  const { features, locales, ...raw } = normalizePackageFields(input);
  const created = await prisma.servicePackage.create({
    data: {
      ...raw,
      locales: { create: Object.entries(locales || {}).map(([locale, content]) => ({ locale, ...content })) },
      features: { create: featuresToCreate(features) },
    },
  });
  return getPackage(created.id);
}

export async function updatePackage(id, input) {
  const existing = await prisma.servicePackage.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Package not found.");

  const { features, locales, ...rest } = normalizePackageFields(input);
  await prisma.$transaction(async (tx) => {
    await tx.servicePackage.update({ where: { id }, data: rest });

    const submitted = Object.keys(locales || {});
    await tx.servicePackageLocale.deleteMany({ where: { packageId: id, locale: { notIn: submitted } } });
    for (const locale of submitted) {
      const content = locales[locale];
      await tx.servicePackageLocale.upsert({
        where: { packageId_locale: { packageId: id, locale } },
        update: content,
        create: { packageId: id, locale, ...content },
      });
    }

    await replaceFeatures(tx, "packageFeature", "packageId", id, features);
  });

  return getPackage(id);
}

export async function deletePackage(id) {
  const existing = await prisma.servicePackage.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Package not found.");
  await prisma.servicePackage.delete({ where: { id } });
  return true;
}

export async function ensureUniqueSlug(model, slug, { excludeId } = {}) {
  const where = excludeId ? { slug, NOT: { id: excludeId } } : { slug };
  const found = await prisma[model].findFirst({ where });
  if (found) throw new ApiError(409, "CONFLICT", "A record with this slug already exists.");
}

// ---------------------------------------------------------------------------
// Public (published) catalog reads
//
// Only published records are exposed. Products are public when AVAILABLE or
// UPCOMING; packages only when AVAILABLE. Locale resolution falls back to the
// default locale (tr) and then to any available locale so a partially
// translated record still renders instead of disappearing.
// ---------------------------------------------------------------------------

const PUBLIC_PRODUCT_STATUSES = ["AVAILABLE", "UPCOMING"];
const PUBLIC_PACKAGE_STATUSES = ["AVAILABLE"];

const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

export function resolveLocaleContent(localeFields, locale) {
  if (!localeFields) return {};
  return (
    localeFields[locale] ||
    localeFields[DEFAULT_LOCALE] ||
    Object.values(localeFields)[0] ||
    {}
  );
}

export function resolveLocaleList(listByLocale, locale) {
  if (!listByLocale) return [];
  return (
    listByLocale[locale] ||
    listByLocale[DEFAULT_LOCALE] ||
    Object.values(listByLocale)[0] ||
    []
  );
}

function mapPublicProduct(item, locale) {
  const content = resolveLocaleContent(item.localeFields, locale);
  return {
    id: item.id,
    slug: item.slug,
    status: item.status,
    sortOrder: item.sortOrder,
    category: item.category
      ? {
          slug: item.category.slug,
          title: resolveLocaleContent(localeList(item.category), locale).title ?? "",
        }
      : null,
    title: content.title ?? "",
    tagline: content.tagline ?? "",
    shortDescription: content.shortDescription ?? "",
    description: content.description ?? "",
    targetAudience: content.targetAudience ?? "",
    ctaText: content.ctaText ?? "",
    useCases: Array.isArray(content.useCases) ? content.useCases : [],
    features: resolveLocaleList(item.featureList, locale),
    seoTitle: content.seoTitle ?? "",
    seoDescription: content.seoDescription ?? "",
  };
}

function mapPublicPackage(item, locale) {
  const content = resolveLocaleContent(item.localeFields, locale);
  const data = content.data && typeof content.data === "object" ? content.data : {};
  return {
    id: item.id,
    slug: item.slug,
    kind: item.kind,
    status: item.status,
    pricingModel: item.pricingModel,
    billingPeriod: item.billingPeriod,
    priceAmount: item.priceAmount ? Number(item.priceAmount) : null,
    currency: item.currency ?? null,
    sortOrder: item.sortOrder,
    productSlug: item.product?.slug ?? null,
    title: content.title ?? "",
    tagline: content.tagline ?? "",
    description: content.description ?? "",
    priceLabel: content.priceLabel ?? "",
    ctaText: content.ctaText ?? "",
    useCases: Array.isArray(data.useCases) ? data.useCases : [],
    included: Array.isArray(data.included) ? data.included : [],
    features: resolveLocaleList(item.featureList, locale),
    seoTitle: content.seoTitle ?? "",
    seoDescription: content.seoDescription ?? "",
  };
}

const publicProductInclude = () => ({
  locales: true,
  features: { orderBy: { sortOrder: "asc" }, include: { locales: true } },
  category: { include: { locales: true } },
});

const publicPackageInclude = () => ({
  locales: true,
  features: { orderBy: { sortOrder: "asc" }, include: { locales: true } },
  product: { include: { locales: true } },
});

export async function listPublishedProducts({ locale } = {}) {
  const items = await prisma.product.findMany({
    where: { status: { in: PUBLIC_PRODUCT_STATUSES } },
    include: publicProductInclude(),
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return items.map((item) => {
    const mapped = mapPublicProduct(
      { ...item, localeFields: localeList(item), featureList: localeListOfFeatures(item) },
      locale
    );
    return mapped;
  });
}

export async function getPublishedProductBySlug(slug, { locale } = {}) {
  const item = await prisma.product.findFirst({
    where: { slug, status: { in: PUBLIC_PRODUCT_STATUSES } },
    include: {
      ...publicProductInclude(),
      packages: {
        where: { status: { in: PUBLIC_PACKAGE_STATUSES } },
        include: publicPackageInclude(),
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  if (!item) return null;
  const mapped = mapPublicProduct(
    { ...item, localeFields: localeList(item), featureList: localeListOfFeatures(item) },
    locale
  );
  mapped.packages = item.packages.map((pkg) =>
    mapPublicPackage(
      { ...pkg, localeFields: localeList(pkg), featureList: localeListOfFeatures(pkg) },
      locale
    )
  );
  return mapped;
}

export async function listPublishedPackages({ locale, kind } = {}) {
  const where = { status: { in: PUBLIC_PACKAGE_STATUSES } };
  if (kind) where.kind = kind;
  const items = await prisma.servicePackage.findMany({
    where,
    include: publicPackageInclude(),
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return items.map((item) =>
    mapPublicPackage(
      { ...item, localeFields: localeList(item), featureList: localeListOfFeatures(item) },
      locale
    )
  );
}

export async function getPublishedPackageBySlug(slug, { locale } = {}) {
  const item = await prisma.servicePackage.findFirst({
    where: { slug, status: { in: PUBLIC_PACKAGE_STATUSES } },
    include: publicPackageInclude(),
  });
  if (!item) return null;
  return mapPublicPackage(
    { ...item, localeFields: localeList(item), featureList: localeListOfFeatures(item) },
    locale
  );
}