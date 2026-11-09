"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentUser, requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEditDesign } from "@/lib/designs";
import { canPostDesigns, isStaff } from "@/lib/roles";
import { savePhoto } from "@/lib/storage";
import { uniqueSlug } from "@/lib/unique-slug";
import { optionalInt, optionalNumber, optionalText, webUrl } from "@/lib/validation";
import type { FormState } from "./auth";

async function requirePoster() {
  const user = await getCurrentUser();
  if (!user || !user.emailVerifiedAt || !canPostDesigns(user.role)) {
    throw new Error("You do not have permission to post designs.");
  }
  return user;
}

// Uploads one photo (already resized in the browser) and returns its address.
export async function uploadPhoto(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  try {
    await requirePoster();
    const file = formData.get("photo");
    if (!(file instanceof File)) return { error: "No photo received." };
    return { url: await savePhoto(file) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }
}

// Only photos we stored ourselves are accepted.
const photoUrl = z
  .string()
  .refine(
    (url) =>
      url.startsWith("/uploads/designs/") ||
      /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/designs\//i.test(url),
    "Unknown photo.",
  );

const designSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Please enter the design name.").max(120),
  designerId: z.string().min(1, "Please choose the designer."),
  year: optionalInt(2100),
  categoryId: z.string().min(1, "Please choose a category."),
  tags: z
    .string()
    .max(500)
    .transform((value) =>
      [...new Set(value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 20),
    ),
  techniqueIds: z.array(z.string()).max(20),
  difficulty: z
    .enum(["", "SIMPLE", "INTERMEDIATE", "COMPLEX", "SUPER_COMPLEX"])
    .transform((value) => value || null),
  structure: z.enum(["SINGLE_SHEET", "MODULAR"]),
  usesCuts: z.boolean(),
  startingShape: optionalText(60),
  squareSizeCm: optionalNumber(1000),
  modelSizeCm: optionalNumber(1000),
  stepCount: optionalInt(10000),
  foldingTimeMinutes: optionalInt(100000),
  paperTypeId: z.string().transform((value) => value || null),
  paperSize: optionalText(60),
  paperColor: optionalText(60),
  paperTreatment: optionalText(80),
  notes: optionalText(5000),
  photos: z
    .array(z.object({ url: photoUrl, alt: optionalText(200) }))
    .min(1, "Please add at least one photo.")
    .max(10, "Up to 10 photos per design."),
  instructions: z
    .array(
      z.object({
        type: z.enum(["CREASE_PATTERN", "DIAGRAM", "VIDEO", "BOOK"]),
        label: z.string().trim().min(1, "Each instruction link needs a name.").max(120),
        url: webUrl,
        bookTitle: optionalText(200),
      }),
    )
    .max(10),
  shops: z
    .array(
      z.object({
        shopName: z.string().trim().min(1, "Each paper shop needs a name.").max(120),
        url: webUrl,
      }),
    )
    .max(10),
});

export type DesignInput = z.input<typeof designSchema>;

export async function saveDesign(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || !user.emailVerifiedAt || !canPostDesigns(user.role)) {
    return { error: "You do not have permission to post designs." };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "Something went wrong reading the form. Please try again." };
  }
  const parsed = designSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, techniqueIds, photos, instructions, shops, ...fields } = parsed.data;

  const designer = await db.designer.findUnique({ where: { id: fields.designerId } });
  if (!designer) return { error: "Please choose the designer." };
  // Verified designers may only post their own work.
  if (!isStaff(user.role) && designer.userId !== user.id) {
    return { error: "You can only post your own designs." };
  }

  const children = {
    techniques: { set: techniqueIds.map((techniqueId) => ({ id: techniqueId })) },
    photos: { create: photos.map((photo, position) => ({ ...photo, position })) },
    instructionLinks: { create: instructions.map((link, position) => ({ ...link, position })) },
    paperShopLinks: { create: shops.map((shop, position) => ({ ...shop, position })) },
  };

  let slug: string;
  if (id) {
    const existing = await db.design.findUnique({
      where: { id },
      include: { designer: { select: { userId: true } } },
    });
    if (!existing || existing.removedAt) return { error: "This design no longer exists." };
    if (!canEditDesign(user, existing)) return { error: "You cannot edit this design." };

    await db.$transaction([
      db.designPhoto.deleteMany({ where: { designId: id } }),
      db.instructionLink.deleteMany({ where: { designId: id } }),
      db.paperShopLink.deleteMany({ where: { designId: id } }),
      db.design.update({ where: { id }, data: { ...fields, ...children } }),
    ]);
    slug = existing.slug;
    await logActivity(user.id, "design.updated", { type: "design", id }, { title: fields.title });
  } else {
    slug = await uniqueSlug(`${fields.title} ${designer.name}`, async (s) =>
      Boolean(await db.design.findUnique({ where: { slug: s }, select: { id: true } })),
    );
    const design = await db.design.create({
      data: {
        ...fields,
        slug,
        postedById: user.id,
        sharedByStaff: isStaff(user.role) && designer.userId !== user.id,
        techniques: { connect: techniqueIds.map((techniqueId) => ({ id: techniqueId })) },
        photos: children.photos,
        instructionLinks: children.instructionLinks,
        paperShopLinks: children.paperShopLinks,
      },
    });
    await logActivity(user.id, "design.created", { type: "design", id: design.id }, { title: fields.title });
  }

  revalidatePath("/");
  revalidatePath(`/designers/${designer.slug}`);
  redirect(`/designs/${slug}`);
}

// Staff remove a design from public view. It is kept in the database for the record.
export async function removeDesign(formData: FormData) {
  const staff = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const design = await db.design.update({ where: { id }, data: { removedAt: new Date() } });
  await logActivity(staff.id, "design.removed", { type: "design", id }, { title: design.title });
  revalidatePath("/");
  redirect("/staff/designs");
}
