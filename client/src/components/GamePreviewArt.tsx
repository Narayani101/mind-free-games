/** Playful SVG previews for select games */

export function CarPreviewArt({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 72" fill="none" aria-hidden>
      <rect width="120" height="72" rx="12" fill="#E8F8F5" />
      <path
        d="M20 48h80l-6-18H26L20 48zm10-18h60l4 10H26l4-10z"
        fill="#FF8A65"
        stroke="#E65100"
        strokeWidth="2"
      />
      <circle cx="38" cy="50" r="8" fill="#2C3E50" />
      <circle cx="82" cy="50" r="8" fill="#2C3E50" />
      <rect x="44" y="32" width="32" height="14" rx="3" fill="#5DADE2" />
    </svg>
  );
}

export function CandyPreviewArt({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 72" fill="none" aria-hidden>
      <rect width="120" height="72" rx="12" fill="#FDEDEC" />
      <ellipse cx="35" cy="38" rx="14" ry="18" fill="#FF8A65" />
      <ellipse cx="60" cy="34" rx="12" ry="16" fill="#7ED957" />
      <ellipse cx="85" cy="40" rx="13" ry="17" fill="#5DADE2" />
      <ellipse cx="50" cy="52" rx="10" ry="12" fill="#FFD93D" />
    </svg>
  );
}

export function RunnerPreviewArt({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 72" fill="none" aria-hidden>
      <rect width="120" height="72" rx="12" fill="#EAF2F8" />
      <circle cx="55" cy="28" r="10" fill="#F4C27A" />
      <path d="M45 40h20l-4 22H49l-4-22z" fill="#5DADE2" />
      <path d="M48 62h8v6h-8zM60 62h8v6h-8z" fill="#2C3E50" />
      <path d="M38 42l-10 8M72 42l10 8" stroke="#FF8A65" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
