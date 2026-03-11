"use client";

export default function CloudBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0F6FF] via-[#B3E5FC] to-white" />
      <div className="cloud-drift absolute -top-20 left-0 h-64 w-full opacity-30">
        <svg viewBox="0 0 1200 200" className="h-full w-full" preserveAspectRatio="none">
          <ellipse cx="200" cy="100" rx="180" ry="60" fill="white" opacity="0.7" />
          <ellipse cx="500" cy="80" rx="220" ry="70" fill="white" opacity="0.5" />
          <ellipse cx="850" cy="110" rx="160" ry="50" fill="white" opacity="0.6" />
          <ellipse cx="1050" cy="70" rx="200" ry="65" fill="white" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
