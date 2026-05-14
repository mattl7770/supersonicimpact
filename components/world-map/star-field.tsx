"use client";

import { useEffect, useRef } from "react";

type StarFieldProps = {
  /** Approx stars per pixel². Lower = sparser. */
  density?: number;
  className?: string;
};

/**
 * Procedural starfield rendered once into a canvas behind the globe.
 * Single small white dot per star — sparse, Apple-Maps-style.
 */
export function StarField({
  density = 0.00018,
  className = "",
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function paint() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      const total = Math.floor(w * h * density);
      for (let i = 0; i < total; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 0.5 + Math.random() * 0.5;
        ctx.globalAlpha = 0.45 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    paint();

    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
