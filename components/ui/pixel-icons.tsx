/**
 * Pixel Art Icon Library — 16x16 SVG pixel sprites.
 * All icons use currentColor, scaled via CSS, rendered with image-rendering: pixelated.
 * Replaces ALL emoji usage across the app.
 */

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

function PixelSVG({ size = 16, className = "", color, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color || "currentColor"}
      className={`pixel-render ${className}`}
      style={{ imageRendering: "pixelated" }}
    >
      {children}
    </svg>
  );
}

/** ☀️ → Pixel Sun (Solei brand) */
export function SunIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="7" y="0" width="2" height="2" />
      <rect x="7" y="14" width="2" height="2" />
      <rect x="0" y="7" width="2" height="2" />
      <rect x="14" y="7" width="2" height="2" />
      <rect x="2" y="2" width="2" height="2" />
      <rect x="12" y="2" width="2" height="2" />
      <rect x="2" y="12" width="2" height="2" />
      <rect x="12" y="12" width="2" height="2" />
      <rect x="5" y="4" width="6" height="2" />
      <rect x="4" y="5" width="2" height="6" />
      <rect x="10" y="5" width="2" height="6" />
      <rect x="5" y="10" width="6" height="2" />
      <rect x="6" y="6" width="4" height="4" />
    </PixelSVG>
  );
}

/** 🗺️ → Pixel Map */
export function MapIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="1" y="1" width="14" height="14" opacity="0.15" />
      <rect x="1" y="1" width="2" height="14" />
      <rect x="5" y="3" width="2" height="10" />
      <rect x="9" y="1" width="2" height="12" />
      <rect x="13" y="3" width="2" height="12" />
      <rect x="1" y="1" width="4" height="2" />
      <rect x="5" y="3" width="4" height="2" />
      <rect x="9" y="1" width="4" height="2" />
      <rect x="3" y="13" width="2" height="2" />
      <rect x="7" y="11" width="2" height="2" />
      <rect x="11" y="13" width="2" height="2" />
    </PixelSVG>
  );
}

/** 📊 → Pixel Chart */
export function ChartIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="1" y="14" width="14" height="2" />
      <rect x="1" y="1" width="2" height="13" />
      <rect x="4" y="8" width="2" height="6" />
      <rect x="7" y="4" width="2" height="10" />
      <rect x="10" y="6" width="2" height="8" />
      <rect x="13" y="2" width="2" height="12" />
    </PixelSVG>
  );
}

/** ⚡ → Pixel Bolt */
export function BoltIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="8" y="0" width="2" height="2" />
      <rect x="6" y="2" width="4" height="2" />
      <rect x="4" y="4" width="6" height="2" />
      <rect x="6" y="6" width="6" height="2" />
      <rect x="8" y="8" width="2" height="2" />
      <rect x="6" y="10" width="2" height="2" />
      <rect x="4" y="12" width="2" height="2" />
      <rect x="6" y="14" width="2" height="2" />
    </PixelSVG>
  );
}

/** 🔒 → Pixel Lock */
export function LockIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="4" y="2" width="8" height="2" />
      <rect x="4" y="2" width="2" height="6" />
      <rect x="10" y="2" width="2" height="6" />
      <rect x="2" y="7" width="12" height="2" />
      <rect x="2" y="7" width="2" height="8" />
      <rect x="12" y="7" width="2" height="8" />
      <rect x="2" y="13" width="12" height="2" />
      <rect x="7" y="9" width="2" height="3" />
    </PixelSVG>
  );
}

/** 💰 → Pixel Coin */
export function CoinIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="5" y="1" width="6" height="2" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="2" y="5" width="2" height="6" />
      <rect x="12" y="5" width="2" height="6" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
      <rect x="5" y="13" width="6" height="2" />
      <rect x="7" y="4" width="2" height="2" />
      <rect x="6" y="6" width="4" height="2" />
      <rect x="7" y="8" width="2" height="2" />
      <rect x="6" y="10" width="4" height="2" />
    </PixelSVG>
  );
}

/** 📡 → Pixel Satellite */
export function SatelliteIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="2" y="2" width="4" height="4" />
      <rect x="6" y="6" width="2" height="2" />
      <rect x="8" y="8" width="2" height="2" />
      <rect x="10" y="10" width="4" height="4" />
      <rect x="0" y="6" width="2" height="2" />
      <rect x="6" y="0" width="2" height="2" />
      <rect x="12" y="6" width="2" height="2" />
      <rect x="6" y="12" width="2" height="2" />
    </PixelSVG>
  );
}

/** ✅ → Pixel Check */
export function CheckIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="12" y="2" width="2" height="2" />
      <rect x="10" y="4" width="2" height="2" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="6" y="8" width="2" height="2" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="2" y="8" width="2" height="2" />
    </PixelSVG>
  );
}

/** ❌ → Pixel X */
export function XIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="2" y="2" width="2" height="2" />
      <rect x="12" y="2" width="2" height="2" />
      <rect x="4" y="4" width="2" height="2" />
      <rect x="10" y="4" width="2" height="2" />
      <rect x="6" y="6" width="4" height="4" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="2" y="12" width="2" height="2" />
      <rect x="12" y="12" width="2" height="2" />
    </PixelSVG>
  );
}

/** 🎉 → Pixel Star/Party */
export function PartyIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="7" y="0" width="2" height="4" />
      <rect x="0" y="7" width="4" height="2" />
      <rect x="12" y="7" width="4" height="2" />
      <rect x="7" y="12" width="2" height="4" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
      <rect x="6" y="6" width="4" height="4" />
    </PixelSVG>
  );
}

/** 🧠 → Pixel Brain */
export function BrainIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="4" y="1" width="8" height="2" />
      <rect x="2" y="3" width="2" height="2" />
      <rect x="12" y="3" width="2" height="2" />
      <rect x="2" y="5" width="2" height="6" />
      <rect x="12" y="5" width="2" height="6" />
      <rect x="4" y="11" width="8" height="2" />
      <rect x="7" y="3" width="2" height="8" />
      <rect x="4" y="5" width="4" height="2" />
      <rect x="8" y="7" width="4" height="2" />
    </PixelSVG>
  );
}

/** ⛓️ → Pixel Chain */
export function ChainIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="3" y="1" width="4" height="2" />
      <rect x="2" y="3" width="2" height="4" />
      <rect x="6" y="3" width="2" height="4" />
      <rect x="3" y="6" width="4" height="2" />
      <rect x="6" y="7" width="4" height="2" />
      <rect x="9" y="8" width="4" height="2" />
      <rect x="8" y="9" width="2" height="4" />
      <rect x="12" y="9" width="2" height="4" />
      <rect x="9" y="13" width="4" height="2" />
    </PixelSVG>
  );
}

/** 💎 → Pixel Diamond */
export function DiamondIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="4" y="1" width="8" height="2" />
      <rect x="2" y="3" width="12" height="2" />
      <rect x="1" y="5" width="14" height="2" />
      <rect x="2" y="7" width="12" height="2" />
      <rect x="3" y="9" width="10" height="2" />
      <rect x="5" y="11" width="6" height="2" />
      <rect x="7" y="13" width="2" height="2" />
    </PixelSVG>
  );
}

/** 🎤 → Pixel Mic */
export function MicIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="6" y="1" width="4" height="2" />
      <rect x="5" y="3" width="6" height="6" />
      <rect x="3" y="5" width="2" height="4" />
      <rect x="11" y="5" width="2" height="4" />
      <rect x="5" y="9" width="6" height="2" />
      <rect x="7" y="11" width="2" height="2" />
      <rect x="5" y="13" width="6" height="2" />
    </PixelSVG>
  );
}

/** Send arrow → Pixel Arrow */
export function SendIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="2" y="7" width="10" height="2" />
      <rect x="10" y="3" width="2" height="2" />
      <rect x="12" y="5" width="2" height="2" />
      <rect x="14" y="7" width="2" height="2" />
      <rect x="12" y="9" width="2" height="2" />
      <rect x="10" y="11" width="2" height="2" />
    </PixelSVG>
  );
}

/** 🌱 → Pixel Leaf */
export function LeafIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="10" y="1" width="4" height="2" />
      <rect x="8" y="3" width="6" height="2" />
      <rect x="6" y="5" width="6" height="2" />
      <rect x="4" y="7" width="6" height="2" />
      <rect x="6" y="9" width="2" height="2" />
      <rect x="4" y="11" width="2" height="2" />
      <rect x="2" y="13" width="2" height="2" />
    </PixelSVG>
  );
}

/** 🌙 → Pixel Moon */
export function MoonIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="8" y="1" width="4" height="2" />
      <rect x="6" y="3" width="2" height="2" />
      <rect x="5" y="5" width="2" height="6" />
      <rect x="6" y="11" width="2" height="2" />
      <rect x="8" y="13" width="4" height="2" />
      <rect x="12" y="3" width="2" height="2" />
      <rect x="12" y="11" width="2" height="2" />
      <rect x="13" y="5" width="2" height="6" />
    </PixelSVG>
  );
}

/** ⚓ → Pixel Anchor */
export function AnchorIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="6" y="1" width="4" height="4" />
      <rect x="7" y="5" width="2" height="8" />
      <rect x="3" y="13" width="10" height="2" />
      <rect x="2" y="9" width="2" height="4" />
      <rect x="12" y="9" width="2" height="4" />
      <rect x="4" y="7" width="8" height="2" />
    </PixelSVG>
  );
}

/** ▲ → Pixel Triangle (Next.js) */
export function TriangleIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="7" y="2" width="2" height="2" />
      <rect x="6" y="4" width="4" height="2" />
      <rect x="5" y="6" width="6" height="2" />
      <rect x="4" y="8" width="8" height="2" />
      <rect x="3" y="10" width="10" height="2" />
      <rect x="2" y="12" width="12" height="2" />
    </PixelSVG>
  );
}

/** 💡 → Pixel Lightbulb */
export function LightbulbIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="5" y="1" width="6" height="2" />
      <rect x="4" y="3" width="2" height="6" />
      <rect x="10" y="3" width="2" height="6" />
      <rect x="5" y="9" width="6" height="2" />
      <rect x="6" y="11" width="4" height="2" />
      <rect x="6" y="13" width="4" height="2" />
      <rect x="6" y="3" width="4" height="2" />
    </PixelSVG>
  );
}

/** 🏆 → Pixel Trophy */
export function TrophyIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="4" y="1" width="8" height="2" />
      <rect x="3" y="3" width="10" height="2" />
      <rect x="1" y="3" width="2" height="4" />
      <rect x="13" y="3" width="2" height="4" />
      <rect x="3" y="5" width="2" height="2" />
      <rect x="11" y="5" width="2" height="2" />
      <rect x="5" y="5" width="6" height="2" />
      <rect x="5" y="7" width="6" height="2" />
      <rect x="6" y="9" width="4" height="2" />
      <rect x="7" y="11" width="2" height="2" />
      <rect x="5" y="13" width="6" height="2" />
    </PixelSVG>
  );
}

/** 🔋 → Pixel Battery */
export function BatteryIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="6" y="1" width="4" height="2" />
      <rect x="3" y="3" width="10" height="2" />
      <rect x="3" y="3" width="2" height="12" />
      <rect x="11" y="3" width="2" height="12" />
      <rect x="3" y="13" width="10" height="2" />
      <rect x="5" y="5" width="6" height="2" />
      <rect x="5" y="8" width="6" height="2" />
      <rect x="5" y="11" width="6" height="2" />
    </PixelSVG>
  );
}

/** 🏠 → Pixel Home */
export function HomeIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="7" y="1" width="2" height="2" />
      <rect x="5" y="3" width="6" height="2" />
      <rect x="3" y="5" width="10" height="2" />
      <rect x="1" y="7" width="14" height="2" />
      <rect x="3" y="9" width="2" height="6" />
      <rect x="11" y="9" width="2" height="6" />
      <rect x="5" y="13" width="6" height="2" />
      <rect x="7" y="9" width="2" height="4" />
    </PixelSVG>
  );
}

/** 🏭 → Pixel Factory */
export function FactoryIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="1" y="12" width="14" height="3" />
      <rect x="2" y="6" width="3" height="6" />
      <rect x="3" y="4" width="2" height="2" />
      <rect x="7" y="8" width="3" height="4" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="11" y="4" width="3" height="8" />
      <rect x="12" y="2" width="2" height="2" />
    </PixelSVG>
  );
}

/** 🌳 → Pixel Tree */
export function TreeIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="6" y="1" width="4" height="2" />
      <rect x="4" y="3" width="8" height="2" />
      <rect x="3" y="5" width="10" height="2" />
      <rect x="5" y="7" width="6" height="2" />
      <rect x="4" y="9" width="8" height="2" />
      <rect x="3" y="11" width="10" height="2" />
      <rect x="7" y="13" width="2" height="2" />
    </PixelSVG>
  );
}

/** 📋 → Pixel Clipboard */
export function ClipboardIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="5" y="1" width="6" height="2" />
      <rect x="3" y="3" width="10" height="2" />
      <rect x="3" y="3" width="2" height="12" />
      <rect x="11" y="3" width="2" height="12" />
      <rect x="3" y="13" width="10" height="2" />
      <rect x="5" y="6" width="6" height="1" />
      <rect x="5" y="8" width="6" height="1" />
      <rect x="5" y="10" width="4" height="1" />
    </PixelSVG>
  );
}

/** 📍 → Pixel Pin */
export function PinIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="5" y="1" width="6" height="2" />
      <rect x="3" y="3" width="2" height="4" />
      <rect x="11" y="3" width="2" height="4" />
      <rect x="5" y="7" width="6" height="2" />
      <rect x="6" y="9" width="4" height="2" />
      <rect x="7" y="11" width="2" height="4" />
      <rect x="5" y="3" width="6" height="2" />
    </PixelSVG>
  );
}


/** 🛒 → Pixel Cart (for buy proposals) */
export function CartIcon(p: IconProps) {
  return (
    <PixelSVG {...p}>
      <rect x="3" y="3" width="10" height="2" />
      <rect x="2" y="5" width="12" height="2" />
      <rect x="3" y="7" width="10" height="2" />
      <rect x="4" y="9" width="8" height="2" />
      <rect x="4" y="11" width="2" height="2" />
      <rect x="10" y="11" width="2" height="2" />
      <rect x="1" y="3" width="2" height="2" />
    </PixelSVG>
  );
}

// ─── SVG String Builders (for Mapbox DOM markers) ───

/**
 * Generates inline SVG markup for use in DOM elements (e.g. Mapbox markers).
 * These can't use React components, so we output raw SVG strings.
 */
export function pixelSunSVG(size: number = 16, color: string = "#FFFFFF"): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="image-rendering:pixelated">
    <rect x="7" y="0" width="2" height="2"/>
    <rect x="7" y="14" width="2" height="2"/>
    <rect x="0" y="7" width="2" height="2"/>
    <rect x="14" y="7" width="2" height="2"/>
    <rect x="2" y="2" width="2" height="2"/>
    <rect x="12" y="2" width="2" height="2"/>
    <rect x="2" y="12" width="2" height="2"/>
    <rect x="12" y="12" width="2" height="2"/>
    <rect x="5" y="4" width="6" height="2"/>
    <rect x="4" y="5" width="2" height="6"/>
    <rect x="10" y="5" width="2" height="6"/>
    <rect x="5" y="10" width="6" height="2"/>
    <rect x="6" y="6" width="4" height="4"/>
  </svg>`;
}

export function pixelHomeSVG(size: number = 16, color: string = "#FFFFFF"): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" style="image-rendering:pixelated">
    <rect x="7" y="1" width="2" height="2"/>
    <rect x="5" y="3" width="6" height="2"/>
    <rect x="3" y="5" width="10" height="2"/>
    <rect x="1" y="7" width="14" height="2"/>
    <rect x="3" y="9" width="2" height="6"/>
    <rect x="11" y="9" width="2" height="6"/>
    <rect x="5" y="13" width="6" height="2"/>
    <rect x="7" y="9" width="2" height="4"/>
  </svg>`;
}
