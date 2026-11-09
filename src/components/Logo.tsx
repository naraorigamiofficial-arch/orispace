// A simple folded-square mark. Placeholder until the final name and brand are chosen.
export function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-[0.18em]">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 22 12 12 22 2 12Z" fill="currentColor" opacity="0.15" />
        <path d="M12 2 22 12H2Z" fill="var(--color-accent)" />
        <path d="M12 2 22 12 12 22 2 12Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      ORISPACE
    </span>
  );
}
