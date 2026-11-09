import Link from "next/link";

export type DesignCardData = {
  slug: string;
  title: string;
  starCount: number;
  designer: { name: string };
  photos: { url: string; alt: string | null }[];
};

export const designCardSelect = {
  slug: true,
  title: true,
  starCount: true,
  designer: { select: { name: true } },
  photos: { select: { url: true, alt: true }, orderBy: { position: "asc" as const }, take: 1 },
};

export function DesignCard({ design }: { design: DesignCardData }) {
  const photo = design.photos[0];
  return (
    <Link href={`/designs/${design.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-soft">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.alt ?? design.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{design.title}</p>
          <p className="truncate text-sm text-muted">{design.designer.name}</p>
        </div>
        <p className="shrink-0 text-sm text-muted" aria-label={`${design.starCount} stars`}>
          &#9733; {design.starCount}
        </p>
      </div>
    </Link>
  );
}

export function DesignGrid({ designs }: { designs: DesignCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
      {designs.map((design) => (
        <DesignCard key={design.slug} design={design} />
      ))}
    </div>
  );
}
