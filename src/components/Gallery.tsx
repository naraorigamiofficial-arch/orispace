"use client";

import { useState } from "react";

export function Gallery({ photos, title }: { photos: { url: string; alt: string | null }[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = photos[active];
  if (!current) return null;
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line bg-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt ?? title} className="max-h-[75vh] w-full object-contain" />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <button
              key={photo.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${index === active ? "border-ink" : "border-transparent"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
