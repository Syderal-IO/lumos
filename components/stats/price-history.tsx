"use client";

/**
 * #7 Price History — Premium line chart with glow effects, data tooltips,
 * animated gradient fill, and trend badge.
 */
const PRICE_DATA = [
  { week: "W1", price: 0.082 },
  { week: "W2", price: 0.085 },
  { week: "W3", price: 0.088 },
  { week: "W4", price: 0.087 },
  { week: "W5", price: 0.090 },
  { week: "W6", price: 0.092 },
];

export default function PriceHistory() {
  const W = 200;
  const H = 70;
  const PAD = 10;
  const min = Math.min(...PRICE_DATA.map((d) => d.price)) * 0.97;
  const max = Math.max(...PRICE_DATA.map((d) => d.price)) * 1.03;

  const points = PRICE_DATA.map((d, i) => ({
    x: PAD + (i / (PRICE_DATA.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((d.price - min) / (max - min)) * (H - PAD * 2),
    price: d.price,
    week: d.week,
  }));

  // Smooth curve
  const smoothLine = points.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `C ${cx.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(" ");

  const areaPath = `${smoothLine} L ${points[points.length - 1].x.toFixed(1)} ${H - PAD} L ${points[0].x.toFixed(1)} ${H - PAD} Z`;

  const lastPrice = PRICE_DATA[PRICE_DATA.length - 1].price;
  const firstPrice = PRICE_DATA[0].price;
  const trendUp = lastPrice >= firstPrice;
  const pctChange = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(1);

  const lineColor = trendUp ? "#22C55E" : "#EF4444";
  const gradColor = trendUp ? "22, 197, 94" : "239, 68, 68";

  return (
    <div className="relative">
      {/* Header with price + trend */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-pixel text-[14px] font-bold neon-text" style={{ color: lineColor }}>
            ${lastPrice.toFixed(3)}
          </span>
          <span className="font-pixel text-[7px]" style={{ color: "var(--foreground-secondary)" }}>/kWh</span>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-0.5"
          style={{
            backgroundColor: `rgba(${gradColor}, 0.15)`,
            border: `1px solid rgba(${gradColor}, 0.3)`,
          }}
        >
          <span className="font-pixel text-[8px] font-bold" style={{ color: lineColor }}>
            {trendUp ? "▲" : "▼"} {pctChange}%
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H + 14}`} className="w-full" style={{ imageRendering: "auto" }}>
        <defs>
          <linearGradient id="priceGradPremium" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
            <stop offset="60%" stopColor={lineColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
          <filter id="priceGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Horizontal grid */}
        {[0.25, 0.5, 0.75].map((r) => {
          const yPos = H - PAD - r * (H - PAD * 2);
          const priceVal = min + r * (max - min);
          return (
            <g key={r}>
              <line x1={PAD} y1={yPos} x2={W - PAD} y2={yPos}
                stroke={`rgba(${gradColor}, 0.08)`} strokeWidth="0.5" />
              <text x={PAD - 1} y={yPos + 1} fill={`rgba(${gradColor}, 0.3)`} fontSize="2.5"
                textAnchor="end" fontFamily="var(--font-pixel)">
                ${priceVal.toFixed(3)}
              </text>
            </g>
          );
        })}

        {/* Gradient fill */}
        <path d={areaPath} fill="url(#priceGradPremium)" />

        {/* Glowing line */}
        <path d={smoothLine} fill="none" stroke={lineColor} strokeWidth="1.5"
          strokeLinejoin="round" filter="url(#priceGlow)" />
        <path d={smoothLine} fill="none" stroke={lineColor} strokeWidth="0.8"
          strokeLinejoin="round" opacity="0.9" />

        {/* Data points with outer glow ring */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={lineColor} opacity="0.15">
              <animate attributeName="r" values="4;6;4" dur="3s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0;0.15" dur="3s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={p.x} cy={p.y} r="2" fill={lineColor} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            {/* Price label on hover dots */}
            <text x={p.x} y={p.y - 5} fill={lineColor} fontSize="2.5" textAnchor="middle"
              fontFamily="var(--font-pixel)" opacity="0.7">
              ${p.price.toFixed(3)}
            </text>
          </g>
        ))}

        {/* Week labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={H + 6}
            fill="rgba(255,255,255,0.35)" fontSize="3" textAnchor="middle" fontFamily="var(--font-pixel)">
            {PRICE_DATA[i].week}
          </text>
        ))}

        {/* Axis baseline */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={`rgba(${gradColor}, 0.12)`} strokeWidth="0.5" />
      </svg>
    </div>
  );
}
