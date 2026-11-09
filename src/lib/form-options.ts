import "server-only";
import type { Role } from "@prisma/client";
import { db } from "./db";
import { isStaff } from "./roles";

// Lists shown in the design form. Staff choose any designer, designers only themselves.
export async function loadDesignFormOptions(user: { id: string; role: Role }) {
  const [designers, categories, techniques, paperTypes] = await Promise.all([
    db.designer.findMany({
      where: isStaff(user.role) ? {} : { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({ select: { id: true, name: true }, orderBy: { position: "asc" } }),
    db.technique.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.paperType.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return { designers, categories, techniques, paperTypes };
}
