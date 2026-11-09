import { AuthCard } from "@/components/AuthCard";
import { ResetPasswordForm } from "@/components/forms/AuthForms";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthCard title="Choose a new password">
      {token ? <ResetPasswordForm token={token} /> : <p>This link is missing its code. Please use the link from your email.</p>}
    </AuthCard>
  );
}
