import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Shared designs" };

export default async function StaffDesignsPage() {
  await requireStaff();
  const designs = await db.design.findMany({
    where: { removedAt: null },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { designer: { select: { name: true } }, postedBy: { select: { name: true } } },
  });
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Designs</h1>
        <Link href="/staff/designs/new" className="btn-primary">Share a design</Link>
      </div>
      <div className="card mt-6 divide-y divide-line">
        {designs.length === 0 && <p className="p-6 text-muted">No designs yet.</p>}
        {designs.map((design) => (
          <div key={design.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Link href={`/designs/${design.slug}`} className="font-medium hover:underline">{design.title}</Link>
              <p className="text-sm text-muted">
                by {design.designer.name} &middot; posted by {design.postedBy.name}
              </p>
            </div>
            <Link href={`/designs/${design.slug}/edit`} className="text-sm underline">Edit</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
