"use client";

import { useEffect, useRef, ReactNode } from "react";

/**
 * #11 Parallax Section — Subtle parallax on scroll (translateY at slower rate).
 */
export default function ParallaxSection({
  children,
  speed = 0.05,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const parent = el.closest("[style*='overflow']") || window;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const offset = rect.top * speed;
      el.style.transform = `translateY(${offset}px)`;
    };

    const target = parent === window ? window : parent;
    target.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => target.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`parallax-section ${className}`}>
      {children}
    </div>
  );
}
