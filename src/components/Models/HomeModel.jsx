"use client";
import { ConstellationField } from "@/effects/constellation-field/ConstellationField";
import "@/effects/constellation-field/styles.css";

export default function HomeModel() {
  return (
    <div className="effect-frame" aria-hidden="true">
      <ConstellationField variant="particle-drift" mode="dark"  speed={1}
             size={2}
             length={0.70}
             density={2.04}
             opacity={1.00}
             hue={5}
             saturation={1.00}
             brightness={1.00} />
    </div>
  );
}
