"use client";

/**
 * #5 Production Chart — Premium 24h SVG chart with animated gradient,
 * glowing peak indicator, data grid, and ambient light effects.
 */
const HOURS_24 = [0,0,0,0,0,0,0.2,0.8,1.5,2.8,3.6,4.1,4.3,4.0,3.5,2.8,1.8,0.8,0.1,0,0,0,0,0];
const MAX_VAL = Math.max(...HOURS_24);

export default function ProductionChart() {
  const W = 200;
  const H = 80;
  const PAD_X = 8;
  const PAD_TOP = 18;
  const PAD_BOT = 8;
  const currentHour = new Date().getHours();
  const peakHour = HOURS_24.indexOf(MAX_VAL);

  const points = HOURS_24.map((v, i) => {
    const x = PAD_X + (i / 23) * (W - PAD_X * 2);
    const y = H - PAD_BOT - (v / MAX_VAL) * (H - PAD_TOP - PAD_BOT);
    return { x, y, v };
  });

  // Smooth curve via cubic bezier
  const smoothLine = points.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `C ${cx.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(" ");

  const areaPath = `${smoothLine} L ${points[points.length - 1].x.toFixed(1)} ${H - PAD_BOT} L ${points[0].x.toFixed(1)} ${H - PAD_BOT} Z`;
  const nowX = PAD_X + (currentHour / 23) * (W - PAD_X * 2);
  const peakX = points[peakHour]?.x || 0;
  const peakY = points[peakHour]?.y || 0;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" style={{ imageRendering: "auto" }}>
        <defs>
          {/* Multi-stop premium gradient */}
          <linearGradient id="prodGradPremium" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#FB923C" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0.02" />
          </linearGradient>
          {/* Glow filter for the line */}
          <filter id="prodGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Peak glow */}
          <radialGradient id="peakGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient grid */}
        {[0.25, 0.5, 0.75, 1].map((r) => {
          const yPos = H - PAD_BOT - r * (H - PAD_TOP - PAD_BOT);
          return (
            <g key={r}>
              <line x1={PAD_X} y1={yPos} x2={W - PAD_X} y2={yPos}
                stroke="rgba(249,115,22,0.08)" strokeWidth="0.5" />
              <text x={PAD_X - 1} y={yPos + 1} fill="rgba(249,115,22,0.3)" fontSize="2.5" textAnchor="end"
                fontFamily="var(--font-pixel)">
                {(MAX_VAL * r).toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Gradient fill area */}
        <path d={areaPath} fill="url(#prodGradPremium)" />

        {/* Glowing line */}
        <path d={smoothLine} fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinejoin="round" filter="url(#prodGlow)" />
        <path d={smoothLine} fill="none" stroke="#FB923C" strokeWidth="0.8" strokeLinejoin="round" />

        {/* Peak indicator — glowing circle + label */}
        <circle cx={peakX} cy={peakY} r="8" fill="url(#peakGlow)">
          <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx={peakX} cy={peakY} r="2.5" fill="#FBBF24" stroke="#F97316" strokeWidth="0.8">
          <animate attributeName="r" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x={peakX} y={peakY - 6} fill="#FBBF24" fontSize="3" textAnchor="middle"
          fontFamily="var(--font-pixel)" fontWeight="bold">
          {MAX_VAL.toFixed(1)} kWh
        </text>

        {/* Current time indicator — animated pulse line */}
        <line x1={nowX} y1={PAD_TOP} x2={nowX} y2={H - PAD_BOT}
          stroke="#FBBF24" strokeWidth="0.6" strokeDasharray="2,2">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </line>
        <circle cx={nowX} cy={points[currentHour]?.y || H - PAD_BOT} r="2" fill="#FBBF24" stroke="rgba(251,191,36,0.4)" strokeWidth="3">
          <animate attributeName="strokeWidth" values="3;6;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="strokeOpacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Data point dots along the curve */}
        {points.filter((_, i) => HOURS_24[i] > 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="0.8" fill="#FB923C" opacity="0.6" />
        ))}

        {/* Hour labels with highlight on current */}
        {[0, 4, 8, 12, 16, 20, 23].map((h) => (
          /* eslint-disable-next-line react/jsx-key */
          <text key={h} x={PAD_X + (h / 23) * (W - PAD_X * 2)} y={H + 8}
            fill={h === currentHour ? "#FBBF24" : "rgba(255,255,255,0.3)"}
            fontSize="3.5" textAnchor="middle" fontFamily="var(--font-pixel)"
            fontWeight={h === currentHour ? "bold" : "normal"}>
            {h}h
          </text>
        ))}

        {/* Axis baseline */}
        <line x1={PAD_X} y1={H - PAD_BOT} x2={W - PAD_X} y2={H - PAD_BOT} stroke="rgba(249,115,22,0.15)" strokeWidth="0.5" />
      </svg>

      {/* Stats overlay */}
      <div className="absolute top-1 right-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#FBBF24" }} />
        <span className="font-pixel text-[7px]" style={{ color: "#FBBF24" }}>LIVE</span>
      </div>
    </div>
  );
}
