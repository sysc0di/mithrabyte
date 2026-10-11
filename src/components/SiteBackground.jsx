"use client";
import dynamic from "next/dynamic";

const DotMatrixBackground = dynamic(
  () => import("@/effects/dot-matrix/DotMatrixBackground"),
  { ssr: false }
);

export default function SiteBackground() {
  return (
    <div className="site-background" aria-hidden="true">
      <DotMatrixBackground
        speed={1}
        gridScale={60}
        mouseAmount={0.04}
        pulseSpeed={0.4}
        radius={0.05}
        opacity={0.35}
        hue={5}
      />
    </div>
  );
}
