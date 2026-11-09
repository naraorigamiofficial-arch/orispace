import { notFound, redirect } from "next/navigation";
import { DesignerForm } from "@/components/forms/DesignerForm";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/roles";

export const metadata = { title: "Edit designer entry" };

export default async function EditDesignerPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  const designer = await db.designer.findUnique({ where: { id: (await params).id } });
  if (!designer) notFound();
  if (designer.userId && !isAdmin(staff.role)) redirect(`/designers/${designer.slug}`);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Edit {designer.name}</h1>
      <div className="mt-8">
        <DesignerForm designer={designer} />
      </div>
    </div>
  );
}
