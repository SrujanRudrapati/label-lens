import type { ReactNode } from "react";

interface IconProps {
  className?: string;
  children: ReactNode;
}

/** 24px line icons drawn for this page; always decorative, the text next to them carries the meaning. */
export function LineIcon({ className = "size-5", children }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const ICON_PATHS = {
  camera: (
    <>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
      <circle cx="12" cy="12.8" r="3.2" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  quote: <path d="M7 7h4v4c0 3-1.5 4.5-4 5M15 7h4v4c0 3-1.5 4.5-4 5" />,
  // A wrapped bar with a nutrition panel.
  food: (
    <>
      <rect x="3.5" y="7" width="17" height="10" rx="2" />
      <path d="M7.5 10.5h5M7.5 13.5h3" />
    </>
  ),
  // A medicine box with a cross.
  medicine: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
  // A trigger spray bottle.
  spray: (
    <>
      <path d="M9 9h5l1 3v8H8v-8z" />
      <path d="M10 9V6h4l3 1.5M17 4.5v.01M19 6.5v.01" />
    </>
  ),
  // A speech bubble.
  language: (
    <>
      <path d="M5 6h14v9H11l-4 3.5V15H5z" />
      <path d="M9 10.5h6" />
    </>
  ),
  // A shield, for what you're protecting yourself from.
  shield: <path d="M12 3.5 19 6v5.5c0 4.3-3 7.5-7 9-4-1.5-7-4.7-7-9V6z" />,
  // A capsule.
  pill: (
    <>
      <rect x="3.5" y="9" width="17" height="6" rx="3" transform="rotate(-35 12 12)" />
      <path d="m10.3 9.6 3.4 4.8" />
    </>
  ),
  // A sprouting leaf.
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19 13 11" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
  cross: <path d="m7 7 10 10M17 7 7 17" />,
  check: <path d="m5.5 12.5 4 4 9-9" />,
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return <LineIcon className={className}>{ICON_PATHS[name]}</LineIcon>;
}
