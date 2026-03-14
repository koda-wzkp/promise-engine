"use client";

import { useEffect, useRef, useState } from "react";
import {
  acknowledgedNations,
  locations,
  type AcknowledgedNation,
  type Location,
} from "../../lib/data/indigenous-acknowledgment";

interface IndigenousAcknowledgmentProps {
  variant: "footer" | "standalone";
}

// ── Shared sub-component: tribe name link ──

function NationLink({
  nation,
  className,
  linkClassName,
}: {
  nation: AcknowledgedNation;
  className?: string;
  linkClassName?: string;
}) {
  return (
    <span className={className}>
      <a
        href={nation.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit the ${nation.name} official website (opens in new tab)`}
        className={
          linkClassName ??
          "underline decoration-dotted underline-offset-2 hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 rounded"
        }
      >
        {nation.name}
        {nation.endonym && (
          <span className="font-serif italic ml-1">({nation.endonym})</span>
        )}
      </a>
    </span>
  );
}

// ── Rotating display hook ──

function useRotatingNation() {
  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    Math.floor(Math.random() * acknowledgedNations.length)
  );
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const interval = setInterval(() => {
      if (prefersReducedMotion.current) {
        setCurrentIndex(
          (prev: number) => (prev + 1) % acknowledgedNations.length
        );
      } else {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex(
            (prev: number) => (prev + 1) % acknowledgedNations.length
          );
          setIsVisible(true);
        }, 400);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return { currentNation: acknowledgedNations[currentIndex], isVisible };
}

// ── Footer variant ──

function FooterVariant() {
  const { currentNation, isVisible } = useRotatingNation();

  return (
    <p
      className="text-xs text-[#4b5563] font-sans"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 400ms ease-in-out",
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      This software was made on the land of the{" "}
      <NationLink
        nation={currentNation}
        linkClassName="underline decoration-dotted underline-offset-2 hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 rounded"
      />
      .
    </p>
  );
}

// ── Standalone variant ──

function StandaloneVariant() {
  const { currentNation, isVisible } = useRotatingNation();

  return (
    <section
      aria-labelledby="acknowledgment-heading"
      className="space-y-8"
    >
      {/* Intro */}
      <div className="space-y-4">
        <h2
          id="acknowledgment-heading"
          className="font-serif text-2xl font-bold text-[#1f2937]"
        >
          Land Acknowledgment
        </h2>
        <p className="text-[#374151] leading-relaxed max-w-2xl">
          Promise Pipeline was built on the ancestral, traditional, and
          contemporary lands of indigenous peoples who have stewarded these
          places since time immemorial. We name each nation here to honor
          their enduring presence.
        </p>
      </div>

      {/* Rotating headline */}
      <div
        className="border-l-4 border-gray-300 pl-5 py-1"
        aria-live="polite"
        aria-atomic="true"
      >
        <p
          className="font-serif text-xl text-[#1f2937] leading-relaxed"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 400ms ease-in-out",
          }}
        >
          This software was made on the land of the{" "}
          <NationLink
            nation={currentNation}
            linkClassName="underline decoration-dotted underline-offset-2 hover:text-[#374151] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded font-semibold"
          />
          .
        </p>
      </div>

      {/* Grouped list */}
      <div className="space-y-6">
        {(locations as readonly Location[]).map((loc) => {
          const nations = acknowledgedNations.filter((n) =>
            n.locations.includes(loc)
          );
          if (nations.length === 0) return null;

          return (
            <div key={loc}>
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#6b7280] mb-2">
                {loc}
              </h3>
              <p className="text-[#374151] leading-relaxed">
                {nations.map((nation, i) => (
                  <span key={nation.name}>
                    {i > 0 && (
                      <span
                        className="mx-2 text-[#9ca3af] select-none"
                        aria-hidden="true"
                      >
                        ·
                      </span>
                    )}
                    <NationLink
                      nation={nation}
                      linkClassName="underline decoration-dotted underline-offset-2 hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 rounded"
                    />
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>

      {/* Closing note */}
      <p className="text-sm text-[#6b7280] italic border-t border-gray-200 pt-4">
        If any tribal representative would like to correct, update, or expand
        this acknowledgment, please{" "}
        <a
          href="/about"
          className="underline decoration-dotted underline-offset-2 hover:text-[#374151] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 rounded"
        >
          contact us
        </a>
        .
      </p>
    </section>
  );
}

// ── Main export ──

export default function IndigenousAcknowledgment({
  variant,
}: IndigenousAcknowledgmentProps) {
  if (variant === "standalone") return <StandaloneVariant />;
  return <FooterVariant />;
}
