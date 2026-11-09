import { AuthCard } from "@/components/AuthCard";
import { ForgotPasswordForm } from "@/components/forms/AuthForms";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot your password?" intro="Enter your email and we will send you a link to choose a new one.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
