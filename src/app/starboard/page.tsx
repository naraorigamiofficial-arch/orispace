export const metadata = { title: "Starboard" };

export default function StarboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Starboard</h1>
      <p className="mt-2 text-muted">Designs that have earned more than 100 stars.</p>
      <div className="card mt-8 p-10 text-center text-muted">
        The Starboard fills up once designs start earning stars.
      </div>
    </div>
  );
}
