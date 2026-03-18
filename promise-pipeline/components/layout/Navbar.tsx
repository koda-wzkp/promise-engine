"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_P_PATH = "M 0,340 L 0,0 L 200,0 C 340,0 340,280 200,280 L 60,280 L 60,340 Z";
const NAV_LAYERS = [
  { fill: "#2a8f6a", scale: 1 },
  { fill: "#2a2a4e", scale: 0.618 },
  { fill: "#3e60cf", scale: 0.382 },
  { fill: "#7b41d6", scale: 0.236 },
  { fill: "#c93b3b", scale: 0.146 },
];
const BREATHE_OFFSETS = ["0s", "0.8s", "1.6s", "2.4s", "3.2s"];

function NavMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 340 340"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-shrink-0 block"
    >
      <defs>
        <style>{`
          @keyframes pp-breathe {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.82; }
          }
          .pp-nav-layer {
            transform-origin: 0 0;
            animation: pp-breathe 5s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .pp-nav-layer { animation: none !important; }
          }
        `}</style>
      </defs>
      {NAV_LAYERS.map((layer, i) => (
        <path
          key={i}
          d={NAV_P_PATH}
          fill={layer.fill}
          transform={`scale(${layer.scale})`}
          className="pp-nav-layer"
          style={{ animationDelay: BREATHE_OFFSETS[i] }}
        />
      ))}
    </svg>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <NavMark />
              <span className="font-serif font-semibold text-lg text-gray-900">
                Promise Pipeline
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/demo/hb2021">HB 2021</NavLink>
            <NavLink href="/demo/jcpoa">JCPOA</NavLink>
            <NavLink href="/demo/iss">ISS</NavLink>
            <NavLink href="/personal">Promise Garden</NavLink>
            <NavLink href="/team">Teams</NavLink>
            <NavLink href="/blog">Blog</NavLink>
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
            <MobileNavLink href="/demo/hb2021" onClick={() => setMobileOpen(false)}>HB 2021</MobileNavLink>
            <MobileNavLink href="/demo/jcpoa" onClick={() => setMobileOpen(false)}>JCPOA</MobileNavLink>
            <MobileNavLink href="/demo/iss" onClick={() => setMobileOpen(false)}>ISS</MobileNavLink>
            <MobileNavLink href="/personal" onClick={() => setMobileOpen(false)}>Promise Garden</MobileNavLink>
            <MobileNavLink href="/team" onClick={() => setMobileOpen(false)}>Teams</MobileNavLink>
            <MobileNavLink href="/blog" onClick={() => setMobileOpen(false)}>Blog</MobileNavLink>
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
