"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { requireStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { uniqueSlug } from "@/lib/unique-slug";
import { optionalText, optionalUrl } from "@/lib/validation";
import type { FormState } from "./auth";

const designerSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Please enter the designer's name.").max(120),
  bio: optionalText(2000),
  country: optionalText(80),
  website: optionalUrl,
  instagram: optionalText(80).transform((value) => value?.replace(/^@/, "") ?? null),
  shopUrl: optionalUrl,
});

// Staff create and edit designer entries, for example for designers who are not on ORISPACE.
export async function saveDesigner(_state: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireStaff();
  const parsed = designerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, ...data } = parsed.data;

  let slug: string;
  if (id) {
    const existing = await db.designer.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) return { error: "This designer entry no longer exists." };
    if (existing.userId && staff.role !== "ADMIN") {
      return { error: "This designer has claimed their page, so only they or an admin can edit it." };
    }
    const designer = await db.designer.update({ where: { id }, data });
    slug = designer.slug;
    await logActivity(staff.id, "designer.updated", { type: "designer", id }, { name: data.name });
  } else {
    slug = await uniqueSlug(data.name, async (s) =>
      Boolean(await db.designer.findUnique({ where: { slug: s }, select: { id: true } })),
    );
    const designer = await db.designer.create({ data: { ...data, slug, createdById: staff.id } });
    await logActivity(staff.id, "designer.created", { type: "designer", id: designer.id }, { name: data.name });
  }
  revalidatePath(`/designers/${slug}`);
  redirect(`/designers/${slug}`);
}
