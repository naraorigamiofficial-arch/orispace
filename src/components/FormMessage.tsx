import type { FormState } from "@/app/actions/auth";

export function FormMessage({ state }: { state: FormState }) {
  if (state?.error)
    return (
      <p role="alert" className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
        {state.error}
      </p>
    );
  if (state?.message)
    return <p className="rounded-xl bg-soft px-4 py-3 text-sm">{state.message}</p>;
  return null;
}
