import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "supersonicimpact: explore the real-world impact of supersonic commercial flight";

const ACCENT = "#22d3ee";
const FOREGROUND = "#f5f5f5";
const FOREGROUND_DIM = "rgba(245,245,245,0.55)";
const FOREGROUND_FAINT = "rgba(245,245,245,0.35)";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(ellipse at top right, #0e1a2a 0%, #050810 60%, #02040a 100%)",
          color: FOREGROUND,
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <MachWaveSvg size={56} color={ACCENT} />
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            supersonicimpact
          </div>
        </div>

        {/* Center: tagline + visual */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              maxWidth: 880,
            }}
          >
            Explore the real-world impact of supersonic commercial flight.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: FOREGROUND_DIM,
              fontWeight: 400,
              maxWidth: 880,
            }}
          >
            Route comparisons · Time-value calculator · Economic impact
            simulator
          </div>
        </div>

        {/* Bottom: small line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: FOREGROUND_FAINT,
          }}
        >
          <div style={{ display: "flex" }}>
            A portfolio project by Matt
          </div>
          <div style={{ display: "flex", color: ACCENT, fontWeight: 500 }}>
            supersonicimpact.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function MachWaveSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={(size * 100) / 200}
      viewBox="0 0 200 100"
      fill="none"
      stroke={color}
      strokeWidth={6}
      strokeLinecap="round"
    >
      <path d="M10 50 Q 60 10 110 50" opacity={0.85} />
      <path d="M30 50 Q 75 25 120 50" opacity={0.6} />
      <path d="M50 50 Q 90 35 130 50" opacity={0.35} />
      <circle cx={140} cy={50} r={9} fill={color} stroke="none" />
    </svg>
  );
}
