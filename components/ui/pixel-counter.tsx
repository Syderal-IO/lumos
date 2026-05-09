"use client";

import { useEffect, useRef, useState } from "react";

/**
 * #1 Pixel Counter — Animated odometer-style number roll-up.
 * Interpolates from 0 → target value with easing over duration.
 */
export default function PixelCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  duration = 800,
  className = "",
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span className={`font-pixel tabular-nums ${className}`} style={style}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}
