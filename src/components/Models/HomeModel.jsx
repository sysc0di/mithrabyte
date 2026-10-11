"use client";
import PixelBlastBackground from "@/effects/pixel-blast/PixelBlastBackground";
import "@/effects/pixel-blast/styles.css";

export default function HomeModel() {
  return (
    <div className="pixel-blast-frame" aria-hidden="true">
      <PixelBlastBackground
        color="#D3D5FD"
        variant="square"
        pixelSize={3}
        patternScale={2}
        patternDensity={1}
        pixelSizeJitter={0}
        speed={0.5}
        edgeFade={0.5}
        enableRipples={false}
      />
    </div>
  );
}