import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const ACCENT = "#22d3ee";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050810",
          borderRadius: 6,
        }}
      >
        <svg
          width={26}
          height={13}
          viewBox="0 0 200 100"
          fill="none"
          stroke={ACCENT}
          strokeWidth={14}
          strokeLinecap="round"
        >
          <path d="M10 50 Q 60 10 110 50" opacity={0.9} />
          <path d="M30 50 Q 75 25 120 50" opacity={0.6} />
          <path d="M50 50 Q 90 35 130 50" opacity={0.35} />
          <circle cx={145} cy={50} r={11} fill={ACCENT} stroke="none" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
