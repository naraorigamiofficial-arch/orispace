import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEditDesign, difficultyLabel, formatMinutes, instructionLabel, structureLabel } from "@/lib/designs";

async function loadDesign(slug: string) {
  return db.design.findFirst({
    where: { slug, removedAt: null },
    include: {
      designer: true,
      category: true,
      paperType: true,
      techniques: { orderBy: { name: "asc" } },
      photos: { orderBy: { position: "asc" } },
      instructionLinks: { orderBy: { position: "asc" } },
      paperShopLinks: { orderBy: { position: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const design = await loadDesign((await params).slug);
  if (!design) return {};
  return {
    title: `${design.title} by ${design.designer.name}`,
    description: `${design.title}, an origami design by ${design.designer.name}.`,
    openGraph: design.photos[0] ? { images: [design.photos[0].url] } : undefined,
  };
}

export default async function DesignPage({ params }: { params: Promise<{ slug: string }> }) {
  const design = await loadDesign((await params).slug);
  if (!design) notFound();
  const user = await getCurrentUser();

  const specs: [string, string][] = [];
  if (design.difficulty) specs.push(["Difficulty", difficultyLabel[design.difficulty]]);
  specs.push(["Structure", structureLabel[design.structure]]);
  specs.push(["Cuts", design.usesCuts ? "Uses cuts" : "No cuts"]);
  if (design.startingShape) specs.push(["Starting shape", design.startingShape]);
  if (design.squareSizeCm) specs.push(["Paper size", `${design.squareSizeCm} cm`]);
  if (design.modelSizeCm) specs.push(["Finished size", `${design.modelSizeCm} cm`]);
  if (design.stepCount) specs.push(["Steps", `About ${design.stepCount}`]);
  if (design.foldingTimeMinutes) specs.push(["Folding time", `About ${formatMinutes(design.foldingTimeMinutes)}`]);

  const paper: [string, string][] = [];
  if (design.paperType) paper.push(["Type", design.paperType.name]);
  if (design.paperSize) paper.push(["Size", design.paperSize]);
  if (design.paperColor) paper.push(["Color", design.paperColor]);
  if (design.paperTreatment) paper.push(["Treatment", design.paperTreatment]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
        <Gallery photos={design.photos} title={design.title} />

        <div className="space-y-8">
          <header>
            <p className="text-sm text-muted">
              <Link href={`/search?category=${design.category.slug}`} className="hover:text-ink">{design.category.name}</Link>
              {design.year && <> &middot; {design.year}</>}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{design.title}</h1>
            <p className="mt-3 text-lg">
              Designed by{" "}
              <Link href={`/designers/${design.designer.slug}`} className="font-medium underline underline-offset-4">
                {design.designer.name}
              </Link>
            </p>
            {design.sharedByStaff && (
              <p className="mt-1 text-sm text-muted">
                Shared by <Link href="/about/staff" className="hover:underline">ORISPACE Staff</Link>
              </p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-muted">&#9733; {design.starCount} stars</span>
              {canEditDesign(user, design) && (
                <Link href={`/designs/${design.slug}/edit`} className="btn-quiet px-4 py-1.5">Edit</Link>
              )}
            </div>
          </header>

          {design.instructionLinks.length > 0 && (
            <section>
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Where to fold it from</h2>
              <ul className="mt-3 space-y-2">
                {design.instructionLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer nofollow" className="card flex items-center justify-between gap-3 px-4 py-3 hover:bg-soft">
                      <span className="min-w-0">
                        <span className="block text-xs text-muted">{instructionLabel[link.type]}</span>
                        <span className="block truncate font-medium">{link.bookTitle ?? link.label}</span>
                        {link.bookTitle && <span className="block truncate text-sm text-muted">{link.label}</span>}
                      </span>
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <DetailList title="Specs" rows={specs} />
          {design.techniques.length > 0 && (
            <section>
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Techniques</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {design.techniques.map((technique) => (
                  <span key={technique.id} className="rounded-full bg-soft px-3 py-1 text-sm">{technique.name}</span>
                ))}
              </div>
            </section>
          )}
          {paper.length > 0 && <DetailList title="Paper used" rows={paper} />}

          {design.paperShopLinks.length > 0 && (
            <section>
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Where to buy the paper</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {design.paperShopLinks.map((shop) => (
                  <li key={shop.id}>
                    <a href={shop.url} target="_blank" rel="noopener noreferrer nofollow" className="btn-quiet">{shop.shopName} &rarr;</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {design.notes && (
            <section>
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Designer&apos;s notes</h2>
              <p className="mt-3 whitespace-pre-line">{design.notes}</p>
            </section>
          )}

          {design.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {design.tags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="text-sm text-muted hover:text-ink">#{tag}</Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="mt-16 border-t border-line pt-8">
        <h2 className="text-xl font-semibold">Comments</h2>
        <p className="mt-2 text-sm text-muted">Comments are coming soon.</p>
      </section>
    </div>
  );
}

function DetailList({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted">{title}</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
