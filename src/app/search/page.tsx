export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{q ? `Results for "${q}"` : "Search"}</h1>
      <div className="card mt-8 p-10 text-center text-muted">
        No designs yet. Designs will appear here as they are shared.
      </div>
    </div>
  );
}
