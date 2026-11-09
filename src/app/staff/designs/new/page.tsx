import Link from "next/link";
import { DesignForm } from "@/components/forms/DesignForm";
import { requireStaff } from "@/lib/auth";
import { loadDesignFormOptions } from "@/lib/form-options";

export const metadata = { title: "Share a design" };

export default async function NewDesignPage({
  searchParams,
}: {
  searchParams: Promise<{ designer?: string }>;
}) {
  const staff = await requireStaff();
  const options = await loadDesignFormOptions(staff);
  const { designer } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Share a design</h1>
      <p className="mt-1 text-sm text-muted">
        The design is credited to its designer. Is the designer missing?{" "}
        <Link href="/staff/designers/new" className="underline">Create their entry first</Link>.
      </p>
      <div className="mt-8">
        <DesignForm {...options} initial={{ designerId: designer }} />
      </div>
    </div>
  );
}
