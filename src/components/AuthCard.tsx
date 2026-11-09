export function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {intro && <p className="mt-2 text-sm text-muted">{intro}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
