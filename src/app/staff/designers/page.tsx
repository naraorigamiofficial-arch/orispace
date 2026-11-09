import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Designer entries" };

export default async function StaffDesignersPage() {
  await requireStaff();
  const designers = await db.designer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { designs: { where: { removedAt: null } } } } },
  });
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Designer entries</h1>
        <Link href="/staff/designers/new" className="btn-primary">New designer entry</Link>
      </div>
      <div className="card mt-6 divide-y divide-line">
        {designers.length === 0 && <p className="p-6 text-muted">No designer entries yet.</p>}
        {designers.map((designer) => (
          <div key={designer.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Link href={`/designers/${designer.slug}`} className="font-medium hover:underline">{designer.name}</Link>
              <p className="text-sm text-muted">
                {designer._count.designs} designs &middot; {designer.userId ? "Claimed by the designer" : "Unclaimed"}
              </p>
            </div>
            {!designer.userId && (
              <Link href={`/staff/designers/${designer.id}/edit`} className="text-sm underline">Edit</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
