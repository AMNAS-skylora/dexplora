"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  value: string; // e.g. "10,000+" or "450+" or "25+" or "100K+"
  className?: string;
  duration?: number;
}

export function Counter({ value, className = "", duration = 1600 }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    // Extract numbers and suffix
    const match = value.match(/([\d,.]+)(.*)/);
    if (!match) {
      return;
    }

    const numericTarget = parseFloat(match[1].replace(/,/g, ""));
    const suffix = match[2] || "";

    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          let startTime: number | null = null;

          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
            const currentNum = Math.floor(easeProgress * numericTarget);

            setDisplayValue(`${currentNum.toLocaleString()}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(step);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.2 }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [value, duration]);

  // Dynamic responsive font scaling for count numbers
  const valLength = value.length;
  let fontScaleClass = "text-[clamp(25px,7.5vw,34px)]";
  if (valLength >= 8) {
    fontScaleClass = "text-[clamp(20px,5.5vw,28px)]";
  } else if (valLength >= 6) {
    fontScaleClass = "text-[clamp(22px,6.2vw,31px)]";
  }

  return (
    <span
      ref={ref}
      className={`font-bold text-[#3478F6] leading-none tracking-[-0.025em] block text-center whitespace-nowrap overflow-hidden [font-variant-numeric:tabular-nums] ${fontScaleClass} ${className}`}
    >
      {displayValue}
    </span>
  );
}
