import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0F13" }}>
        <svg width="140" height="80" viewBox="40 6 140 68">
          <path d="M46 48 L62 12 L80 68 L98 30 L116 68 L134 12 L150 48" fill="none" stroke="#0E7C66" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="166" cy="48" r="9" fill="#FF6A3D" />
        </svg>
      </div>
    ),
    size,
  );
}
