import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { consumeEmailToken, roleAfterVerification } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Confirm email" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const userId = token ? await consumeEmailToken(token, "VERIFY_EMAIL") : null;

  if (!userId) {
    return (
      <AuthCard title="This link did not work">
        <p className="text-sm text-muted">
          It may have expired or already been used. You can ask for a new one from your{" "}
          <Link href="/account" className="text-ink underline">account page</Link>.
        </p>
      </AuthCard>
    );
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  await db.user.update({
    where: { id: userId },
    data: {
      emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      role: roleAfterVerification(user.email, user.role),
    },
  });

  return (
    <AuthCard title="Email confirmed">
      <p className="text-sm text-muted">Thank you. You can now star designs and comment.</p>
      <Link href="/" className="btn-primary mt-6 w-full">Start exploring</Link>
    </AuthCard>
  );
}
