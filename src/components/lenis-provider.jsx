"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

const LenisContext = createContext(null);

export function LenisProvider({ children, options = {} }) {
  const lenisRef = useRef(null);
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const instance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // Keep native touch scrolling on phones/tablets; syncTouch drives every
      // frame through JS and freezes the page on Android while scrolling.
      syncTouch: false,
      ...options,
    });

    lenisRef.current = instance;
    setLenis(instance);

    function raf(time) {
      instance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}

export function useLenis() {
  return useContext(LenisContext);
}
