"use client";

/**
 * AnimatedBackground — Renders a living gradient mesh via inline styles.
 * Dark mode only — no theme switching needed.
 */
export default function AnimatedBackground({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const colors = {
    bg: "#0A0E1A",
    c1: "#1A1228",
    c2: "#14110A",
    c3: "#0C1220",
  };

  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(-45deg, ${colors.bg} 0%, ${colors.c1} 17%, ${colors.bg} 33%, ${colors.c2} 50%, ${colors.bg} 67%, ${colors.c3} 83%, ${colors.bg} 100%)`,
        backgroundSize: "600% 600%",
        animation: "gradient-mesh 12s ease infinite",
      }}
    >
      {children}
    </div>
  );
}
