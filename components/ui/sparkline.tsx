"use client";

/**
 * #7 Sparkline — Mini 24h production chart for MeterHeader.
 */
export default function Sparkline({ data, color = "#FBBF24", width = 80, height = 24 }: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 200, animation: "sparkline-draw 1.5s ease-out forwards" } as React.CSSProperties}
      />
      {/* Glow dot at the end */}
      <circle
        cx={width}
        cy={parseFloat(points.split(" ").pop()!.split(",")[1])}
        r="2.5"
        fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}
