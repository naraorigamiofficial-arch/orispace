import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DesignGrid, designCardSelect } from "@/components/DesignCard";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin, isStaff } from "@/lib/roles";

async function loadDesigner(slug: string) {
  return db.designer.findUnique({
    where: { slug },
    include: {
      designs: {
        where: { removedAt: null },
        select: designCardSelect,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const designer = await loadDesigner((await params).slug);
  return designer ? { title: designer.name, description: `Origami designs by ${designer.name}.` } : {};
}

export default async function DesignerPage({ params }: { params: Promise<{ slug: string }> }) {
  const designer = await loadDesigner((await params).slug);
  if (!designer) notFound();
  const user = await getCurrentUser();
  const totalStars = designer.designs.reduce((sum, design) => sum + design.starCount, 0);
  const canEdit = user && isStaff(user.role) && (!designer.userId || isAdmin(user.role));

  const links = [
    designer.website && { label: "Website", href: designer.website },
    designer.instagram && { label: `@${designer.instagram}`, href: `https://instagram.com/${designer.instagram}` },
    designer.shopUrl && { label: "Shop", href: designer.shopUrl },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{designer.name}</h1>
          {designer.userId ? (
            <span className="rounded-full bg-soft px-3 py-1 text-xs font-medium">Verified designer</span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted">
          {[designer.country, `${designer.designs.length} designs`, `${totalStars} stars`].filter(Boolean).join(" · ")}
        </p>
        {designer.bio && <p className="mt-4 whitespace-pre-line">{designer.bio}</p>}
        {links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer nofollow" className="btn-quiet px-4 py-1.5">{link.label}</a>
            ))}
          </div>
        )}
        {canEdit && (
          <Link href={`/staff/designers/${designer.id}/edit`} className="mt-4 inline-block text-sm underline">Edit designer entry</Link>
        )}
      </header>

      <section className="mt-10">
        {designer.designs.length ? (
          <DesignGrid designs={designer.designs} />
        ) : (
          <p className="card p-10 text-center text-muted">No designs yet.</p>
        )}
      </section>

      {!designer.userId && (
        <p className="mt-12 text-sm text-muted">
          Is this you? Claiming this page is coming soon.
        </p>
      )}
    </div>
  );
}
