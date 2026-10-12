import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { SUPPORTED_LOCALES, GLOBAL_LOCALE } from "@/lib/constants";

/**
 * Content & settings domain logic: editable pages, sections, and site settings.
 * System-marked pages can be edited but never deleted; protected settings can
 * only be modified through the seed script.
 */

function localeList(row) {
  const out = {};
  for (const l of row.locales || []) out[l.locale] = l;
  return out;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export async function listPages({ page, pageSize, skip, take } = {}) {
  const [items, total] = await prisma.$transaction([
    prisma.page.findMany({
      include: { locales: true, _count: { select: { sections: true } } },
      orderBy: { createdAt: "asc" },
      skip,
      take,
    }),
    prisma.page.count(),
  ]);
  return {
    items: items.map((it) => ({ ...it, locales: undefined, localeFields: localeList(it) })),
    total,
    page,
    pageSize,
  };
}

export async function getPage(id) {
  const item = await prisma.page.findUnique({
    where: { id },
    include: { locales: true, sections: { orderBy: { sortOrder: "asc" }, include: { locales: true } } },
  });
  if (!item) throw new ApiError(404, "NOT_FOUND", "Page not found.");
  return {
    ...item,
    locales: undefined,
    localeFields: localeList(item),
    sections: item.sections.map((s) => ({ ...s, locales: undefined, localeFields: localeList(s) })),
  };
}

/** Public, active CMS page lookup used by policy pages. */
export async function getPublishedPageByKey(key, locale) {
  const page = await prisma.page.findFirst({
    where: { key, isActive: true },
    include: { locales: true },
  });
  if (!page) return null;
  const localized = page.locales.find((item) => item.locale === locale)
    || page.locales.find((item) => item.locale === "en")
    || page.locales[0];
  return localized ? { key: page.key, updatedAt: page.updatedAt, ...localized } : null;
}

export async function createPage(input) {
  const { locales, ...rest } = input;
  const created = await prisma.page.create({
    data: {
      ...rest,
      locales: { create: Object.entries(locales || {}).map(([locale, content]) => ({ locale, ...content })) },
    },
  });
  return getPage(created.id);
}

export async function updatePage(id, input) {
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Page not found.");

  const { locales, ...rest } = input;
  await prisma.$transaction(async (tx) => {
    await tx.page.update({ where: { id }, data: rest });

    const submitted = Object.keys(locales || {});
    await tx.pageLocale.deleteMany({ where: { pageId: id, locale: { notIn: submitted } } });
    for (const locale of submitted) {
      const content = locales[locale];
      await tx.pageLocale.upsert({
        where: { pageId_locale: { pageId: id, locale } },
        update: content,
        create: { pageId: id, locale, ...content },
      });
    }
  });

  return getPage(id);
}

export async function deletePage(id) {
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Page not found.");
  if (existing.isSystem) {
    throw new ApiError(403, "PROTECTED", "System pages cannot be deleted.");
  }
  await prisma.page.delete({ where: { id } });
  return true;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export async function listSections(pageId) {
  return prisma.section.findMany({
    where: { pageId },
    orderBy: { sortOrder: "asc" },
    include: { locales: true },
  });
}

export async function upsertSection(pageId, input, { id } = {}) {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) throw new ApiError(404, "NOT_FOUND", "Page not found.");

  const { key, sortOrder = 0, locales } = input;

  if (id) {
    const section = await prisma.section.findFirst({ where: { id, pageId } });
    if (!section) throw new ApiError(404, "NOT_FOUND", "Section not found.");
    await prisma.$transaction(async (tx) => {
      await tx.section.update({ where: { id }, data: { key, sortOrder } });
      for (const locale of SUPPORTED_LOCALES) {
        const content = locales?.[locale];
        if (!content) continue;
        await tx.sectionLocale.upsert({
          where: { sectionId_locale: { sectionId: id, locale } },
          update: content,
          create: { sectionId: id, locale, ...content },
        });
      }
    });
    return prisma.section.findUnique({ where: { id }, include: { locales: true } });
  }

  const created = await prisma.section.create({
    data: {
      pageId,
      key,
      sortOrder,
      locales: { create: Object.entries(locales || {}).map(([locale, content]) => ({ locale, ...content })) },
    },
  });
  return prisma.section.findUnique({ where: { id: created.id }, include: { locales: true } });
}

// ---------------------------------------------------------------------------
// Settings (editable site settings vs. protected system settings)
// ---------------------------------------------------------------------------

export async function listSettings() {
  const rows = await prisma.setting.findMany({
    orderBy: { key: "asc" },
    include: { values: true },
  });
  return rows.map((row) => ({
    id: row.id,
    key: row.key,
    isProtected: row.isProtected,
    description: row.description,
    values: Object.fromEntries(row.values.map((v) => [v.locale, v.value])),
  }));
}

/**
 * Updates editable settings. Protected keys are rejected; only requested
 * key/locale pairs are written, leaving others untouched.
 */
export async function patchSettings(patch) {
  const updated = [];

  for (const item of patch.values) {
    const setting = await prisma.setting.findUnique({
      where: { key: item.key },
      include: { values: true },
    });
    if (!setting) continue;
    if (setting.isProtected) {
      throw new ApiError(403, "PROTECTED", `Setting "${item.key}" is protected and cannot be edited.`);
    }

    const locale = item.locale;
    const allowed = locale === GLOBAL_LOCALE || SUPPORTED_LOCALES.includes(locale);
    if (!allowed) {
      throw new ApiError(400, "VALIDATION_ERROR", `Locale "${locale}" is not enabled.`);
    }

    await prisma.settingValue.upsert({
      where: { settingId_locale: { settingId: setting.id, locale } },
      update: { value: item.value },
      create: { settingId: setting.id, locale, value: item.value },
    });
    updated.push({ key: item.key, locale });
  }

  return updated;
}

export { GLOBAL_LOCALE };
