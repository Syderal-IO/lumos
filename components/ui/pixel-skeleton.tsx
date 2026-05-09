"use client";

/**
 * #2 Pixel Skeleton — Shimmer loading placeholder with pixel-art aesthetic.
 */
export default function PixelSkeleton({
  width,
  height = 16,
  variant = "line",
  className = "",
}: {
  width?: number | string;
  height?: number | string;
  variant?: "line" | "card" | "circle";
  className?: string;
}) {
  const styles: React.CSSProperties = {
    width: variant === "circle" ? height : width || "100%",
    height,
    borderRadius: variant === "circle" ? "50%" : 0,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "var(--background-secondary)",
  };

  return (
    <div className={`pixel-skeleton ${className}`} style={styles}>
      <div className="pixel-skeleton-shimmer" />
    </div>
  );
}

/** Pre-built skeleton layouts */
export function SkeletonCard() {
  return (
    <div className="pixel-card p-4 space-y-3" style={{ backgroundColor: "var(--card-bg)" }}>
      <PixelSkeleton width="60%" height={10} />
      <PixelSkeleton width="100%" height={24} />
      <PixelSkeleton width="40%" height={10} />
    </div>
  );
}

export function SkeletonLine({ width = "100%" }: { width?: string }) {
  return <PixelSkeleton width={width} height={10} />;
}
