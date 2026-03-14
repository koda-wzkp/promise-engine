"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Gamepad2 } from "lucide-react";

const DEMO_LINKS = [
  { href: "/demo/hb2021", label: "HB 2021" },
  { href: "/demo/aca", label: "ACA" },
  { href: "/demo/ai", label: "AI Safety" },
  { href: "/demo/infrastructure", label: "Infrastructure" },
  { href: "/demo/supply-chain", label: "Supply Chain" },
  { href: "/demo/war-on-drugs", label: "War on Drugs" },
  { href: "/demo/personal", label: "Personal Demo" },
  { href: "/demo/team", label: "Team Demo" },
];

const PRIMARY_LINKS = [
  { href: "/personal", label: "Personal" },
  { href: "/team", label: "Teams" },
];

const SECONDARY_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/games", label: "Play", icon: "gamepad" as const },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demosOpen, setDemosOpen] = useState(false);
  const demosRef = useRef<HTMLDivElement>(null);

  // Close demos dropdown on outside click
  useEffect(() => {
    if (!demosOpen) return;
    const handler = (e: MouseEvent) => {
      if (demosRef.current && !demosRef.current.contains(e.target as Node)) {
        setDemosOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [demosOpen]);

  const linkClass =
    "text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"
      >
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-serif text-xl font-bold text-gray-900">
            Promise Pipeline
          </span>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
            Beta
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-5 lg:flex">
          {/* Primary links */}
          {PRIMARY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}

          {/* Demos dropdown */}
          <div ref={demosRef} className="relative">
            <button
              onClick={() => setDemosOpen(!demosOpen)}
              className={`${linkClass} flex items-center gap-1`}
              aria-expanded={demosOpen}
              aria-haspopup="true"
            >
              Demos
              <svg
                className={`h-3.5 w-3.5 transition-transform ${demosOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {demosOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {DEMO_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDemosOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <span className="h-4 w-px bg-gray-200" aria-hidden="true" />

          {/* Secondary links */}
          {SECONDARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1 ${
                link.icon === "gamepad"
                  ? "text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
                  : linkClass
              }`}
            >
              {link.icon === "gamepad" && (
                <Gamepad2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 -mr-2 text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 lg:hidden max-h-[80vh] overflow-y-auto"
        >
          {/* Primary */}
          <div className="py-2">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-semibold text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Demos section */}
          <div className="border-t border-gray-100 py-2">
            <p className="py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Demos
            </p>
            <div className="grid grid-cols-2 gap-x-4">
              {DEMO_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm text-gray-600"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Secondary */}
          <div className="border-t border-gray-100 py-2">
            {SECONDARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-1.5 py-2.5 text-sm font-medium ${
                  link.icon === "gamepad"
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              >
                {link.icon === "gamepad" && (
                  <Gamepad2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
