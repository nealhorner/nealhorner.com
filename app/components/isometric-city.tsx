"use client";

import { useEffect, useRef } from "react";
import { clamp } from "@/lib/utilities";
import { generateCity, GRID_WIDTH, GRID_HEIGHT } from "./city-generator";
import {
  renderBasemap,
  renderForeground,
  renderWalkers,
  createWalkers,
  TILE_HEIGHT,
} from "./city-renderer";
import { updateWalkers } from "./walkers";

export default function IsometricCity() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const state = {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      originX: 0,
      originY: -200,
    };

    const dpr = window.devicePixelRatio || 1;

    const { basemap, foreground } = generateCity();
    let walkers = createWalkers(basemap, 0, 0);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }
      const { clientWidth, clientHeight } = parent;
      state.width = clientWidth;
      state.height = clientHeight;
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      canvas.style.width = `${clientWidth}px`;
      canvas.style.height = `${clientHeight}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      const isoHeight = ((GRID_WIDTH + GRID_HEIGHT) * TILE_HEIGHT) / 2;
      state.originX = state.width / 2;
      state.originY = Math.max(60, state.height - isoHeight - 80);

      walkers = createWalkers(basemap, state.originX, state.originY);
      renderBasemap(context, basemap, state.originX, state.originY);
      renderForeground(context, foreground, state.originX, state.originY, tiltX, tiltY);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const maxTilt = 4;
    const perspective = 1200;
    let tiltFrame: number | null = null;
    let tiltX = 0;
    let tiltY = 0;

    const applyTilt = (tiltX: number, tiltY: number) => {
      if (tiltFrame !== null) {
        cancelAnimationFrame(tiltFrame);
      }
      tiltFrame = requestAnimationFrame(() => {
        canvas.style.transform = `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        tiltFrame = null;
      });
    };

    canvas.style.willChange = "transform";
    canvas.style.transition = "transform 180ms ease-out";
    canvas.style.transformStyle = "preserve-3d";

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

      tiltY = clamp(relativeX * maxTilt * 2, -maxTilt, maxTilt);
      tiltX = clamp(-relativeY * maxTilt * 2, -maxTilt, maxTilt);
      applyTilt(tiltX, tiltY);
    };

    const resetTilt = () => {
      applyTilt(0, 0);
    };

    canvas.addEventListener("pointermove", handlePointerMove);

    resize();

    let lastTime = performance.now();
    let animationFrame: number;

    const step = (time: number) => {
      const delta = clamp((time - lastTime) / 1000, 0, 0.1);
      lastTime = time;

      renderBasemap(context, basemap, state.originX, state.originY);

      walkers = updateWalkers(walkers, basemap, state.originX, state.originY, delta);

      renderWalkers(context, walkers);
      renderForeground(context, foreground, state.originX, state.originY, tiltX, tiltY);
      animationFrame = requestAnimationFrame(step);
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      if (tiltFrame !== null) {
        cancelAnimationFrame(tiltFrame);
      }
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", resetTilt);
    };
  }, []);

  return (
    <section className="overflow-hidden" style={{ perspective: "1200px" }}>
      <canvas
        ref={canvasRef}
        className="block h-[600px] w-full"
        role="img"
        aria-label="An isometric canvas rendering of a stylized city with animated walkers leaving light trails."
      />
    </section>
  );
}
