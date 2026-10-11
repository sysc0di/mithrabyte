"use client";
// Ported from ThreeUI — Structure Flow / Dot Matrix (MIT, © Meng To)
// https://threeui.com/three-js/structure-flow/dot-matrix
// A cyan breathing dot matrix with radial depth fade and smoothed pointer drift.
import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uGridScale;
uniform float uMouseAmount;
uniform float uPulseSpeed;
uniform float uRadius;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;
  uv += uMouse * uMouseAmount;
  vec2 grid = fract(uv * uGridScale);
  vec2 id = floor(uv * uGridScale);
  float dist = length(grid - vec2(0.5));
  float pulse = sin(uTime * uPulseSpeed + id.x * 0.05 + id.y * 0.05) * 0.5 + 0.5;
  float radius = 0.08 + pulse * uRadius;
  float alpha = smoothstep(radius, radius - 0.05, dist);
  vec2 center = vec2(0.5 * aspect, 0.5);
  float depthFade = smoothstep(1.2, 0.1, length(uv - center));
  vec3 color = vec3(0.0, 0.9, 1.0) * pulse;
  gl_FragColor = vec4(color, alpha * depthFade * uOpacity);
}
`;

export const DOT_MATRIX_DEFAULTS = {
  speed: 1,
  gridScale: 60,
  mouseAmount: 0.04,
  pulseSpeed: 0.4,
  radius: 0.15,
  opacity: 0.35,
  hue: 0,
};

export default function DotMatrixBackground({
  className = "",
  style,
  ...props
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const optionsRef = useRef({ ...DOT_MATRIX_DEFAULTS, ...props });
  optionsRef.current = { ...DOT_MATRIX_DEFAULTS, ...props };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uMouse: { value: new THREE.Vector2() },
      uGridScale: { value: DOT_MATRIX_DEFAULTS.gridScale },
      uMouseAmount: { value: DOT_MATRIX_DEFAULTS.mouseAmount },
      uPulseSpeed: { value: DOT_MATRIX_DEFAULTS.pulseSpeed },
      uRadius: { value: DOT_MATRIX_DEFAULTS.radius },
      uOpacity: { value: DOT_MATRIX_DEFAULTS.opacity },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(geometry, material));

    const mouse = new THREE.Vector2();
    const target = new THREE.Vector2();
    let rafId = 0;
    let running = true;
    const start = performance.now();

    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      target.x =
        ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      target.y =
        -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      uniforms.uResolution.value.set(rect.width, rect.height);
    };

    const render = (time) => {
      const opts = optionsRef.current;
      mouse.lerp(target, 0.05);
      uniforms.uTime.value = (time - start) * 0.001 * opts.speed;
      uniforms.uMouse.value.copy(mouse);
      uniforms.uGridScale.value = opts.gridScale;
      uniforms.uMouseAmount.value = opts.mouseAmount;
      uniforms.uPulseSpeed.value = opts.pulseSpeed;
      uniforms.uRadius.value = opts.radius;
      uniforms.uOpacity.value = opts.opacity;
      renderer.render(scene, camera);
      rafId = running && !document.hidden ? requestAnimationFrame(render) : 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      running = entry?.isIntersecting ?? true;
      if (running && !rafId) rafId = requestAnimationFrame(render);
      if (!running && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    });

    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    resize();
    rafId = requestAnimationFrame(render);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`threeui-background dot-matrix ${className}`.trim()}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          filter: `hue-rotate(${optionsRef.current.hue}deg)`,
        }}
      />
    </div>
  );
}
