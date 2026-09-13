import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

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
          background: "#ff5a1f",
          borderRadius: 10,
          color: "#fff",
          fontSize: 40,
          fontWeight: 900,
          fontFamily: "sans-serif",
        }}
      >
        B
      </div>
    ),
    size,
  );
}
