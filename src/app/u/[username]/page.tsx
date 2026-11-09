import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DesignGrid, designCardSelect } from "@/components/DesignCard";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/roles";

async function loadProfile(username: string) {
  return db.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      name: true,
      username: true,
      role: true,
      bio: true,
      disabledAt: true,
      designer: { select: { slug: true } },
      postedDesigns: {
        where: { removedAt: null, sharedByStaff: true },
        select: designCardSelect,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const user = await loadProfile((await params).username);
  return user ? { title: user.name } : {};
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const user = await loadProfile((await params).username);
  if (!user || user.disabledAt) notFound();
  const staff = isStaff(user.role);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{user.name}</h1>
          {staff && <span className="rounded-full bg-soft px-3 py-1 text-xs font-medium">ORISPACE Staff</span>}
        </div>
        <p className="mt-1 text-sm text-muted">@{user.username}</p>
        {staff && (
          <p className="mt-4 text-sm text-muted">
            This is an ORISPACE staff account. Staff share designs on behalf of their original
            creators. Every design here is credited to the designer who created it.
          </p>
        )}
        {user.designer && (
          <Link href={`/designers/${user.designer.slug}`} className="btn-quiet mt-4">See their designs</Link>
        )}
        {user.bio && <p className="mt-4 whitespace-pre-line">{user.bio}</p>}
      </header>
      {staff && (
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Designs shared</h2>
          <div className="mt-4">
            {user.postedDesigns.length ? (
              <DesignGrid designs={user.postedDesigns} />
            ) : (
              <p className="card p-10 text-center text-muted">Nothing shared yet.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
