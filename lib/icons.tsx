// Cute SVG icon library, shared between admin (for picking) and page (for rendering).
// Each icon takes className for sizing/color via currentColor.
import React from 'react';

type IconProps = { className?: string; size?: number };

const Wrap = ({ size = 32, children, className }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const Icons = {
  laptop: (p: IconProps) => (
    <Wrap {...p}>
      <rect x="4" y="6" width="24" height="16" rx="2.5" fill="currentColor" opacity=".18" />
      <rect x="4" y="6" width="24" height="16" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="22" width="28" height="3" rx="1.5" fill="currentColor" />
      <path d="M11 11l-3 3 3 3M21 11l3 3-3 3M18 10l-4 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Wrap>
  ),
  coffee: (p: IconProps) => (
    <Wrap {...p}>
      <path d="M6 12h16v8a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-8z" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="1.4" />
      <path d="M22 14h2a3 3 0 0 1 0 6h-2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 4c.6 1.5-.6 2.5 0 4M16 4c.6 1.5-.6 2.5 0 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Wrap>
  ),
  gym: (p: IconProps) => (
    <Wrap {...p}>
      <rect x="2" y="13" width="3" height="6" rx="1" fill="currentColor" />
      <rect x="27" y="13" width="3" height="6" rx="1" fill="currentColor" />
      <rect x="5" y="11" width="3" height="10" rx="1" fill="currentColor" opacity=".55" />
      <rect x="24" y="11" width="3" height="10" rx="1" fill="currentColor" opacity=".55" />
      <rect x="8" y="14" width="16" height="4" rx="1" fill="currentColor" />
    </Wrap>
  ),
  cooking: (p: IconProps) => (
    <Wrap {...p}>
      <path d="M4 14h22v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 12c-1-3 1-4 1-6M15 12c-1-3 1-4 1-6M21 12c-1-3 1-4 1-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Wrap>
  ),
  book: (p: IconProps) => (
    <Wrap {...p}>
      <path d="M4 6c4-1 8-1 12 1v19c-4-2-8-2-12-1V6z" fill="currentColor" opacity=".22" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M28 6c-4-1-8-1-12 1v19c4-2 8-2 12-1V6z" fill="currentColor" opacity=".1" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </Wrap>
  ),
  walk: (p: IconProps) => (
    <Wrap {...p}>
      <circle cx="18" cy="6" r="2.4" fill="currentColor" />
      <path d="M18 10l-3 6 3 3 1 7M15 16l-4 2-2 5M19 19l4 1 2 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Wrap>
  ),
  sleep: (p: IconProps) => (
    <Wrap {...p}>
      <path d="M22 18a8 8 0 1 1-8-12 6.5 6.5 0 0 0 8 12z" fill="currentColor" opacity=".22" stroke="currentColor" strokeWidth="1.4" />
      <path d="M21 7h4l-4 4h4M17 4h3l-3 3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </Wrap>
  ),
  flower: (p: IconProps) => (
    <Wrap {...p}>
      <circle cx="16" cy="9" r="4" fill="currentColor" opacity=".55" />
      <circle cx="9" cy="14" r="4" fill="currentColor" opacity=".4" />
      <circle cx="23" cy="14" r="4" fill="currentColor" opacity=".4" />
      <circle cx="12" cy="20" r="4" fill="currentColor" opacity=".55" />
      <circle cx="20" cy="20" r="4" fill="currentColor" opacity=".55" />
      <circle cx="16" cy="15" r="2.5" fill="currentColor" />
    </Wrap>
  ),
  heart: (p: IconProps) => (
    <Wrap {...p}>
      <path d="M16 28s-11-6.5-11-14a6 6 0 0 1 11-3.3A6 6 0 0 1 27 14c0 7.5-11 14-11 14z" fill="currentColor" />
    </Wrap>
  ),
  game: (p: IconProps) => (
    <Wrap {...p}>
      <path d="M8 10h16a5 5 0 0 1 5 5v3a4 4 0 0 1-7 2l-2-2h-8l-2 2a4 4 0 0 1-7-2v-3a5 5 0 0 1 5-5z" fill="currentColor" opacity=".22" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="22" cy="15" r="1.4" fill="currentColor" />
      <circle cx="25" cy="18" r="1.4" fill="currentColor" />
      <path d="M9 15h4M11 13v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Wrap>
  ),
  car: (p: IconProps) => (
    <Wrap {...p}>
      <path d="M5 18l2-6a3 3 0 0 1 3-2h12a3 3 0 0 1 3 2l2 6v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2H9v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-5z" fill="currentColor" opacity=".22" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="20" r="2" fill="currentColor" />
      <circle cx="22" cy="20" r="2" fill="currentColor" />
    </Wrap>
  ),
  film: (p: IconProps) => (
    <Wrap {...p}>
      <rect x="4" y="6" width="24" height="20" rx="2" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 6v20M24 6v20M4 11h4M4 16h4M4 21h4M24 11h4M24 16h4M24 21h4" stroke="currentColor" strokeWidth="1.2" />
    </Wrap>
  ),
};

export type IconKey = keyof typeof Icons;

export const ICON_LIST: { key: IconKey; label: string }[] = [
  { key: 'laptop', label: 'coding' },
  { key: 'coffee', label: 'coffee' },
  { key: 'gym', label: 'gym' },
  { key: 'cooking', label: 'cooking' },
  { key: 'book', label: 'reading' },
  { key: 'walk', label: 'walking' },
  { key: 'sleep', label: 'sleeping' },
  { key: 'flower', label: 'thinking of you' },
  { key: 'heart', label: 'in love' },
  { key: 'game', label: 'gaming' },
  { key: 'car', label: 'driving' },
  { key: 'film', label: 'watching' },
];

// helper to render either an emoji string or an icon key like "icon:laptop"
export function renderStatusGlyph(value: string | undefined, size = 36) {
  if (!value) return <Icons.flower size={size} />;
  if (value.startsWith('icon:')) {
    const key = value.slice(5) as IconKey;
    const Comp = Icons[key] || Icons.flower;
    return <Comp size={size} />;
  }
  return <span style={{ fontSize: size }}>{value}</span>;
}
