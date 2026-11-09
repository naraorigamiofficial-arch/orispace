import { DesignerForm } from "@/components/forms/DesignerForm";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "New designer entry" };

export default async function NewDesignerPage() {
  await requireStaff();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">New designer entry</h1>
      <p className="mt-1 text-sm text-muted">
        For designers who are not on ORISPACE yet. They can claim this page later.
      </p>
      <div className="mt-8">
        <DesignerForm />
      </div>
    </div>
  );
}
