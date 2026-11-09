import { notFound, redirect } from "next/navigation";
import { DesignForm } from "@/components/forms/DesignForm";
import { removeDesign } from "@/app/actions/designs";
import { requireVerifiedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEditDesign } from "@/lib/designs";
import { loadDesignFormOptions } from "@/lib/form-options";
import { isStaff } from "@/lib/roles";

export const metadata = { title: "Edit design" };

export default async function EditDesignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireVerifiedUser(`/designs/${slug}/edit`);
  const design = await db.design.findFirst({
    where: { slug, removedAt: null },
    include: {
      designer: { select: { userId: true } },
      techniques: { select: { id: true } },
      photos: { orderBy: { position: "asc" } },
      instructionLinks: { orderBy: { position: "asc" } },
      paperShopLinks: { orderBy: { position: "asc" } },
    },
  });
  if (!design) notFound();
  if (!canEditDesign(user, design)) redirect(`/designs/${slug}`);

  const options = await loadDesignFormOptions(user);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Edit {design.title}</h1>
      <div className="mt-8">
        <DesignForm
          {...options}
          initial={{
            id: design.id,
            title: design.title,
            designerId: design.designerId,
            year: design.year ?? "",
            categoryId: design.categoryId,
            tags: design.tags.join(", "),
            techniqueIds: design.techniques.map((technique) => technique.id),
            difficulty: design.difficulty ?? "",
            structure: design.structure,
            usesCuts: design.usesCuts,
            startingShape: design.startingShape ?? "",
            squareSizeCm: design.squareSizeCm ?? "",
            modelSizeCm: design.modelSizeCm ?? "",
            stepCount: design.stepCount ?? "",
            foldingTimeMinutes: design.foldingTimeMinutes ?? "",
            paperTypeId: design.paperTypeId ?? "",
            paperSize: design.paperSize ?? "",
            paperColor: design.paperColor ?? "",
            paperTreatment: design.paperTreatment ?? "",
            notes: design.notes ?? "",
            photos: design.photos.map((photo) => ({ url: photo.url, alt: photo.alt ?? "" })),
            instructions: design.instructionLinks.map((link) => ({
              type: link.type,
              label: link.label,
              url: link.url,
              bookTitle: link.bookTitle ?? "",
            })),
            shops: design.paperShopLinks.map((shop) => ({ shopName: shop.shopName, url: shop.url })),
          }}
        />
      </div>
      {isStaff(user.role) && (
        <form action={removeDesign} className="mt-12 border-t border-line pt-6">
          <input type="hidden" name="id" value={design.id} />
          <p className="text-sm text-muted">Removing hides this design from everyone. It stays in the records.</p>
          <button className="mt-3 text-sm text-accent underline">Remove this design</button>
        </form>
      )}
    </div>
  );
}
