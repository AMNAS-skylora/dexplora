"use client";

import { useEffect, useState } from "react";

interface HeroWordRevealProps {
  text: string;
  className?: string;
  wordDelay?: number; // 50ms-80ms
}

export function HeroWordReveal({ text, className = "", wordDelay = 65 }: HeroWordRevealProps) {
  const [mounted, setMounted] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, idx) => (
        <span
          key={idx}
          className="inline-block mr-[0.25em] last:mr-0"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translate3d(0, 0, 0)" : "translate3d(0, 15px, 0)",
            transitionProperty: "opacity, transform",
            transitionDuration: "600ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: `${idx * wordDelay}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
