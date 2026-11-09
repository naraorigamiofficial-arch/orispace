import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await db.category.findMany({ orderBy: { position: "asc" } });
  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 pb-12 pt-16 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Find your next fold.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Original origami designs, credited to their creators, with the paper, technique and
          instructions you need to fold them.
        </p>
        <form action="/search" className="mx-auto mt-8 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">Search designs</label>
          <input
            id="q"
            name="q"
            className="input rounded-full px-5 py-3"
            placeholder="Try dragon, crane, tessellation..."
          />
          <button className="btn-primary px-6">Search</button>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Browse</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${category.slug}`}
              className="rounded-full border border-line bg-card px-4 py-2 text-sm hover:bg-soft"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
