import "server-only";
import { randomBytes } from "node:crypto";
import { slugify } from "./slug";

// Finds a free web address like "ancient-dragon", adding a short code if it is taken.
export async function uniqueSlug(
  text: string,
  isTaken: (slug: string) => Promise<boolean>,
) {
  const base = slugify(text) || "untitled";
  if (!(await isTaken(base))) return base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${randomBytes(2).toString("hex")}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  return `${base}-${randomBytes(4).toString("hex")}`;
}
