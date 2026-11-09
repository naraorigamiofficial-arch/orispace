import { readFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_UPLOAD_DIR } from "@/lib/storage";

const TYPES: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", png: "image/png" };

// Serves photos saved on your own computer during development. On Vercel, photos live in Vercel Blob.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (process.env.VERCEL) return new Response("Not found", { status: 404 });
  const parts = (await params).path;
  const file = path.join(LOCAL_UPLOAD_DIR, ...parts);
  if (!file.startsWith(LOCAL_UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    const type = TYPES[path.extname(file).slice(1)] ?? "application/octet-stream";
    return new Response(new Uint8Array(data), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
