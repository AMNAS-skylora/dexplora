"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number; // Delay between children in ms
  baseDelay?: number;
  threshold?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 80,
  baseDelay = 0,
  threshold = 0.15,
  className = "",
}: StaggerContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      data-visible={isVisible}
      style={
        {
          "--stagger-delay": `${staggerDelay}ms`,
          "--base-delay": `${baseDelay}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  index: number;
  className?: string;
  duration?: number;
}

export function StaggerItem({ children, index, className = "", duration = 550 }: StaggerItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = ref.current?.closest("[data-visible]");
    if (!parent) {
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }

    const checkVisibility = () => {
      if (parent.getAttribute("data-visible") === "true") {
        setIsVisible(true);
      }
    };

    checkVisibility();
    const observer = new MutationObserver(checkVisibility);
    observer.observe(parent, { attributes: true, attributeFilter: ["data-visible"] });

    return () => observer.disconnect();
  }, []);

  const delay = index * 80;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 18px, 0) scale(0.98)",
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
