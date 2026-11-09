import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const ALLOWED = new Map([
  ["image/webp", "webp"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
// Used only when running on your own computer, served by src/app/uploads/[...path]/route.ts.
export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");

// Saves a photo and returns its public address.
// On Vercel (BLOB_READ_WRITE_TOKEN set) photos go to Vercel Blob. Locally they go to the .uploads folder.
export async function savePhoto(file: File) {
  const extension = ALLOWED.get(file.type);
  if (!extension) throw new Error("Photos must be JPG, PNG or WebP.");
  if (file.size > MAX_PHOTO_BYTES) throw new Error("This photo is too large.");

  const name = `designs/${Date.now()}-${randomBytes(6).toString("hex")}.${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.VERCEL) throw new Error("Photo storage is not set up yet.");

  const target = path.join(LOCAL_UPLOAD_DIR, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
