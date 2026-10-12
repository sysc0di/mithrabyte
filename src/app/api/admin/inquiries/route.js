import { ok, withHandler, pageParams } from "@/lib/api";
import { listInquiries, inboxStats, INQUIRY_STATUSES } from "@/lib/services/inquiries";
import { guard } from "@/lib/api/admin-guard";

/**
 * /api/admin/inquiries — paginated, filterable inbox list + status counts.
 */
export const dynamic = "force-dynamic";

export const GET = withHandler(async (req) => {
  await guard(req);
  const sp = req.nextUrl.searchParams;
  const paging = pageParams(sp, 25);
  const status = sp.get("status");
  const [list, stats] = await Promise.all([
    listInquiries({
      ...paging,
      status: INQUIRY_STATUSES.includes(status) ? status : undefined,
      search: sp.get("search") || undefined,
    }),
    inboxStats(),
  ]);
  return ok({ ...list, stats });
});