import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { SignupForm } from "@/components/forms/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Join" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <AuthCard title="Join ORISPACE" intro="An account lets you star designs and join the conversation.">
      <SignupForm />
    </AuthCard>
  );
}
