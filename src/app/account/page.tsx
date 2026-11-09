import { ResendVerificationForm } from "@/components/forms/AuthForms";
import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";

export const metadata = { title: "Your account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; reset?: string; verify?: string }>;
}) {
  const user = await requireUser("/account");
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      {params.welcome && (
        <p className="rounded-xl bg-soft px-4 py-3 text-sm">Welcome to ORISPACE, {user.name}.</p>
      )}
      {params.reset && (
        <p className="rounded-xl bg-soft px-4 py-3 text-sm">Your password has been changed.</p>
      )}

      <section className="card p-6">
        <h1 className="text-2xl font-semibold">{user.name}</h1>
        <p className="mt-1 text-sm text-muted">@{user.username}</p>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-1 break-all">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Account type</dt>
            <dd className="mt-1">{roleLabel[user.role]}</dd>
          </div>
        </dl>
      </section>

      {!user.emailVerifiedAt && (
        <section className="card p-6">
          <h2 className="font-semibold">Confirm your email</h2>
          <p className="mt-1 text-sm text-muted">
            {params.verify
              ? "You need to confirm your email before you can do that. "
              : ""}
            We sent a link to {user.email}. Confirming lets you star designs and comment.
          </p>
          <div className="mt-4">
            <ResendVerificationForm />
          </div>
        </section>
      )}

      <form action={logout}>
        <button className="btn-quiet">Log out</button>
      </form>
    </div>
  );
}
