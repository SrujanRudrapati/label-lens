"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface NavProps {
  /** The profile link: always reachable, on phones too. */
  profile: ReactNode;
  onOpenApp: () => void;
}

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#proof", label: "Proof" },
  { href: "#faq", label: "FAQ" },
] as const;

/** Sticky top bar; it turns translucent once the page scrolls under it. */
export function Nav({ profile, onOpenApp }: NavProps) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(entry ? !entry.isIntersecting : false));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="h-px" />
      <header
        className={`sticky top-0 z-40 -mx-5 -mt-px px-5 transition-[background-color,box-shadow] duration-200 ${
          scrolled ? "bg-paper/80 shadow-[0_1px_0_rgba(24,38,58,0.1)] backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex min-h-14 max-w-[1120px] flex-wrap items-center justify-between gap-x-6 lg:min-h-18">
          <a href="#top" className="text-lead font-bold">
            Label Lens
          </a>
          <nav aria-label="Page" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="flex min-h-12 items-center rounded-full px-4 font-bold text-ink-soft hover:text-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            {profile}
            <button
              type="button"
              onClick={onOpenApp}
              className="hidden min-h-12 items-center rounded-full bg-ink px-6 font-bold text-paper shadow-[0_10px_22px_-12px_rgba(24,38,58,0.6)] lg:flex"
            >
              Open the app
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
