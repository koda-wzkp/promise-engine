"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { NestedPLogo } from "@/components/brand/NestedPLogo";

const DEMOS = [
  { href: "/demo/hb2021", label: "HB 2021", subtitle: "Oregon Clean Electricity" },
  { href: "/demo/jcpoa", label: "JCPOA", subtitle: "Iran Nuclear Agreement" },
  { href: "/demo/gresham", label: "Gresham", subtitle: "Climate Action Plan" },
  { href: "/demo/iss", label: "ISS", subtitle: "International Space Station" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demosOpen, setDemosOpen] = useState(false);
  const [mobileDemosOpen, setMobileDemosOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setDemosOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDemosOpen(false);
      }
    }
    if (demosOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [demosOpen]);

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <NestedPLogo mode="breathe" size={28} className="flex-shrink-0" />
              <span className="font-serif font-semibold text-lg text-gray-900">
                Promise Pipeline
              </span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 leading-none">
                beta
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Demos dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                aria-haspopup="true"
                aria-expanded={demosOpen}
                onClick={() => setDemosOpen((o) => !o)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Demos
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${demosOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {demosOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                  {DEMOS.map((demo) => (
                    <Link
                      key={demo.href}
                      href={demo.href}
                      onClick={() => setDemosOpen(false)}
                      className="flex flex-col px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">{demo.label}</span>
                      <span className="text-xs text-gray-500">{demo.subtitle}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink href="/personal">Garden</NavLink>
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/learn">Learn</NavLink>
            <NavLink href="/about">About</NavLink>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex items-center p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {/* Demos group */}
            <button
              onClick={() => setMobileDemosOpen((o) => !o)}
              className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Demos
              <svg
                className={`w-4 h-4 transition-transform ${mobileDemosOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {mobileDemosOpen && (
              <div className="pl-4 space-y-1">
                {DEMOS.map((demo) => (
                  <Link
                    key={demo.href}
                    href={demo.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col px-3 py-2 rounded-md hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-900">{demo.label}</span>
                    <span className="text-xs text-gray-500">{demo.subtitle}</span>
                  </Link>
                ))}
              </div>
            )}

            <MobileNavLink href="/personal" onClick={() => setMobileOpen(false)}>Garden</MobileNavLink>
            <MobileNavLink href="/services" onClick={() => setMobileOpen(false)}>Services</MobileNavLink>
            <MobileNavLink href="/blog" onClick={() => setMobileOpen(false)}>Blog</MobileNavLink>
            <MobileNavLink href="/learn" onClick={() => setMobileOpen(false)}>Learn</MobileNavLink>
            <MobileNavLink href="/about" onClick={() => setMobileOpen(false)}>About</MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
