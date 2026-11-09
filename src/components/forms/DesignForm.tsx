"use client";

import { startTransition, useActionState, useState } from "react";
import { saveDesign, uploadPhoto, type DesignInput } from "@/app/actions/designs";
import { FormMessage } from "../FormMessage";

type Option = { id: string; name: string };
type Photo = { url: string; alt: string };
type Instruction = { type: DesignInput["instructions"][number]["type"]; label: string; url: string; bookTitle: string };
type Shop = { shopName: string; url: string };

export type DesignFormInitial = Partial<
  Omit<DesignInput, "photos" | "instructions" | "shops" | "tags" | "usesCuts">
> & {
  tags?: string;
  usesCuts?: boolean;
  photos?: Photo[];
  instructions?: Instruction[];
  shops?: Shop[];
};

const MAX_SIDE = 2000;
const TARGET_BYTES = 900 * 1024;

// Shrinks a photo in the browser before upload, so pages stay fast and storage stays cheap.
async function preparePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let quality = 0.86;
  let blob: Blob | null = null;
  while (quality > 0.4) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.size <= TARGET_BYTES) break;
    quality -= 0.12;
  }
  if (!blob) throw new Error("This photo could not be read.");
  return blob;
}

const val = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export function DesignForm({
  initial = {},
  designers,
  categories,
  techniques,
  paperTypes,
}: {
  initial?: DesignFormInitial;
  designers: Option[];
  categories: Option[];
  techniques: Option[];
  paperTypes: Option[];
}) {
  const [state, formAction, pending] = useActionState(saveDesign, undefined);
  const [photos, setPhotos] = useState<Photo[]>(initial.photos ?? []);
  const [instructions, setInstructions] = useState<Instruction[]>(initial.instructions ?? []);
  const [shops, setShops] = useState<Shop[]>(initial.shops ?? []);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState("");

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    setUploadError("");
    const list = Array.from(files).slice(0, 10 - photos.length);
    setUploading((count) => count + list.length);
    for (const file of list) {
      try {
        const prepared = await preparePhoto(file);
        const data = new FormData();
        data.set("photo", new File([prepared], "photo.webp", { type: "image/webp" }));
        const result = await uploadPhoto(data);
        if ("error" in result) setUploadError(result.error);
        else setPhotos((current) => [...current, { url: result.url, alt: "" }]);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setUploading((count) => count - 1);
      }
    }
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: DesignInput = {
      id: initial.id,
      title: val(formData, "title"),
      designerId: val(formData, "designerId"),
      year: val(formData, "year"),
      categoryId: val(formData, "categoryId"),
      tags: val(formData, "tags"),
      techniqueIds: formData.getAll("techniqueIds").map(String),
      difficulty: val(formData, "difficulty") as DesignInput["difficulty"],
      structure: val(formData, "structure") as DesignInput["structure"],
      usesCuts: formData.get("usesCuts") === "on",
      startingShape: val(formData, "startingShape"),
      squareSizeCm: val(formData, "squareSizeCm"),
      modelSizeCm: val(formData, "modelSizeCm"),
      stepCount: val(formData, "stepCount"),
      foldingTimeMinutes: val(formData, "foldingTimeMinutes"),
      paperTypeId: val(formData, "paperTypeId"),
      paperSize: val(formData, "paperSize"),
      paperColor: val(formData, "paperColor"),
      paperTreatment: val(formData, "paperTreatment"),
      notes: val(formData, "notes"),
      photos,
      instructions,
      shops,
    };
    const data = new FormData();
    data.set("payload", JSON.stringify(payload));
    startTransition(() => formAction(data));
  }

  const str = (value: unknown) => (value === null || value === undefined ? "" : String(value));

  return (
    <form onSubmit={submit} className="space-y-8">
      <Section title="The design">
        <Field label="Design name" htmlFor="title">
          <input className="input" id="title" name="title" defaultValue={initial.title} required />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Designer" htmlFor="designerId">
            <select className="input" id="designerId" name="designerId" defaultValue={initial.designerId ?? (designers.length === 1 ? designers[0].id : "")} required>
              {designers.length !== 1 && <option value="">Choose the designer</option>}
              {designers.map((designer) => (
                <option key={designer.id} value={designer.id}>{designer.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Year designed" htmlFor="year">
            <input className="input" id="year" name="year" inputMode="numeric" defaultValue={str(initial.year)} />
          </Field>
          <Field label="Category" htmlFor="categoryId">
            <select className="input" id="categoryId" name="categoryId" defaultValue={initial.categoryId ?? ""} required>
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Search words" htmlFor="tags" hint="Separate with commas, for example: dragon, winged, mythical">
            <input className="input" id="tags" name="tags" defaultValue={initial.tags} />
          </Field>
        </div>
      </Section>

      <Section title="Photos" intro="Up to 10. The first photo is the main one.">
        {photos.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <li key={photo.url} className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="aspect-square w-full object-cover" />
                <div className="space-y-2 p-2">
                  <input
                    className="input px-2 py-1 text-sm"
                    placeholder="Describe the photo"
                    value={photo.alt}
                    onChange={(event) =>
                      setPhotos((current) =>
                        current.map((item, i) => (i === index ? { ...item, alt: event.target.value } : item)),
                      )
                    }
                  />
                  <div className="flex justify-between text-sm">
                    <button type="button" className="px-1 text-muted hover:text-ink" onClick={() => movePhoto(index, -1)} aria-label="Move earlier">&larr;</button>
                    <button type="button" className="text-accent" onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}>Remove</button>
                    <button type="button" className="px-1 text-muted hover:text-ink" onClick={() => movePhoto(index, 1)} aria-label="Move later">&rarr;</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {photos.length < 10 && (
          <label className="btn-quiet cursor-pointer">
            {uploading > 0 ? `Uploading ${uploading}...` : "Add photos"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={uploading > 0}
              onChange={(event) => {
                addPhotos(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        )}
        {uploadError && <p className="text-sm text-accent">{uploadError}</p>}
      </Section>

      <Section title="Technique and specs">
        <fieldset>
          <legend className="label">Techniques</legend>
          <div className="flex flex-wrap gap-2">
            {techniques.map((technique) => (
              <label key={technique.id} className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-sm has-[:checked]:border-ink has-[:checked]:bg-soft">
                <input type="checkbox" name="techniqueIds" value={technique.id} defaultChecked={initial.techniqueIds?.includes(technique.id)} />
                {technique.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Difficulty" htmlFor="difficulty">
            <select className="input" id="difficulty" name="difficulty" defaultValue={initial.difficulty ?? ""}>
              <option value="">Not stated</option>
              <option value="SIMPLE">Simple</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="COMPLEX">Complex</option>
              <option value="SUPER_COMPLEX">Super complex</option>
            </select>
          </Field>
          <Field label="Structure" htmlFor="structure">
            <select className="input" id="structure" name="structure" defaultValue={initial.structure ?? "SINGLE_SHEET"}>
              <option value="SINGLE_SHEET">Single sheet</option>
              <option value="MODULAR">Modular</option>
            </select>
          </Field>
          <Field label="Starting shape" htmlFor="startingShape">
            <input className="input" id="startingShape" name="startingShape" placeholder="Square" defaultValue={str(initial.startingShape)} />
          </Field>
          <Field label="Paper size (cm)" htmlFor="squareSizeCm">
            <input className="input" id="squareSizeCm" name="squareSizeCm" inputMode="decimal" defaultValue={str(initial.squareSizeCm)} />
          </Field>
          <Field label="Finished size (cm)" htmlFor="modelSizeCm">
            <input className="input" id="modelSizeCm" name="modelSizeCm" inputMode="decimal" defaultValue={str(initial.modelSizeCm)} />
          </Field>
          <Field label="Number of steps" htmlFor="stepCount">
            <input className="input" id="stepCount" name="stepCount" inputMode="numeric" defaultValue={str(initial.stepCount)} />
          </Field>
          <Field label="Folding time (minutes)" htmlFor="foldingTimeMinutes">
            <input className="input" id="foldingTimeMinutes" name="foldingTimeMinutes" inputMode="numeric" defaultValue={str(initial.foldingTimeMinutes)} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="usesCuts" defaultChecked={initial.usesCuts} />
          This design uses cuts
        </label>
      </Section>

      <Section title="Paper">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Paper type" htmlFor="paperTypeId">
            <select className="input" id="paperTypeId" name="paperTypeId" defaultValue={initial.paperTypeId ?? ""}>
              <option value="">Not stated</option>
              {paperTypes.map((paper) => (
                <option key={paper.id} value={paper.id}>{paper.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Paper size" htmlFor="paperSize">
            <input className="input" id="paperSize" name="paperSize" placeholder="35 x 35 cm" defaultValue={str(initial.paperSize)} />
          </Field>
          <Field label="Color" htmlFor="paperColor">
            <input className="input" id="paperColor" name="paperColor" defaultValue={str(initial.paperColor)} />
          </Field>
          <Field label="Treatment" htmlFor="paperTreatment">
            <input className="input" id="paperTreatment" name="paperTreatment" placeholder="Methylcellulose, glue coated..." defaultValue={str(initial.paperTreatment)} />
          </Field>
        </div>
      </Section>

      <Section title="Where to fold it from" intro="Link to the official crease pattern, diagram, video or book. Never upload them.">
        {instructions.map((link, index) => (
          <div key={index} className="card grid gap-3 p-4 sm:grid-cols-[10rem_1fr_1fr_auto]">
            <select
              className="input"
              aria-label="Type"
              value={link.type}
              onChange={(event) => updateAt(setInstructions, index, { type: event.target.value as Instruction["type"] })}
            >
              <option value="CREASE_PATTERN">Crease pattern</option>
              <option value="DIAGRAM">Diagram</option>
              <option value="VIDEO">Video</option>
              <option value="BOOK">Book</option>
            </select>
            <input className="input" placeholder={link.type === "BOOK" ? "Shop name, for example Amazon" : "Name, for example Official CP"} value={link.label} onChange={(event) => updateAt(setInstructions, index, { label: event.target.value })} />
            <input className="input" type="url" placeholder="https://" value={link.url} onChange={(event) => updateAt(setInstructions, index, { url: event.target.value })} />
            <button type="button" className="text-sm text-accent" onClick={() => setInstructions((current) => current.filter((_, i) => i !== index))}>Remove</button>
            {link.type === "BOOK" && (
              <input className="input sm:col-span-3" placeholder="Book title" value={link.bookTitle} onChange={(event) => updateAt(setInstructions, index, { bookTitle: event.target.value })} />
            )}
          </div>
        ))}
        <button type="button" className="btn-quiet" onClick={() => setInstructions((current) => [...current, { type: "CREASE_PATTERN", label: "", url: "", bookTitle: "" }])}>
          Add an instruction link
        </button>
      </Section>

      <Section title="Where to buy the paper">
        {shops.map((shop, index) => (
          <div key={index} className="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]">
            <input className="input" placeholder="Shop name" value={shop.shopName} onChange={(event) => updateAt(setShops, index, { shopName: event.target.value })} />
            <input className="input" type="url" placeholder="https://" value={shop.url} onChange={(event) => updateAt(setShops, index, { url: event.target.value })} />
            <button type="button" className="text-sm text-accent" onClick={() => setShops((current) => current.filter((_, i) => i !== index))}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn-quiet" onClick={() => setShops((current) => [...current, { shopName: "", url: "" }])}>
          Add a paper shop
        </button>
      </Section>

      <Section title="Designer's notes">
        <textarea className="input min-h-32" name="notes" aria-label="Designer's notes" placeholder="Optional. Tips, history or anything folders should know." defaultValue={str(initial.notes)} />
      </Section>

      <div className="sticky bottom-0 -mx-4 space-y-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur">
        <FormMessage state={state} />
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending || uploading > 0}>
          {pending ? "Saving..." : initial.id ? "Save changes" : "Publish design"}
        </button>
      </div>
    </form>
  );
}

function updateAt<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, change: Partial<T>) {
  setter((current) => current.map((item, i) => (i === index ? { ...item, ...change } : item)));
}

function Section({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {intro && <p className="text-sm text-muted">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
