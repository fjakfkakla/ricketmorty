"use client";

import { useEffect, useRef, useCallback } from "react";

export interface JoystickState {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

interface VirtualJoystickProps {
  onChange: (state: JoystickState) => void;
}

export default function VirtualJoystick({ onChange }: VirtualJoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouch = useRef<number | null>(null);
  const baseCenter = useRef({ x: 0, y: 0 });
  const RADIUS = 48;

  const resetKnob = useCallback(() => {
    if (knobRef.current) {
      knobRef.current.style.transform = "translate(-50%, -50%)";
    }
    onChange({ x: 0, y: 0 });
    activeTouch.current = null;
  }, [onChange]);

  const moveKnob = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - baseCenter.current.x;
      const dy = clientY - baseCenter.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamp = Math.min(dist, RADIUS);
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * clamp;
      const ky = Math.sin(angle) * clamp;

      if (knobRef.current) {
        knobRef.current.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
      }

      onChange({
        x: kx / RADIUS,
        y: ky / RADIUS,
      });
    },
    [onChange]
  );

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      if (activeTouch.current !== null) return;
      const touch = e.changedTouches[0];
      activeTouch.current = touch.identifier;
      const rect = base!.getBoundingClientRect();
      baseCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      moveKnob(touch.clientX, touch.clientY);
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === activeTouch.current) {
          moveKnob(touch.clientX, touch.clientY);
          break;
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === activeTouch.current) {
          resetKnob();
          break;
        }
      }
    }

    base.addEventListener("touchstart", onTouchStart, { passive: false });
    base.addEventListener("touchmove", onTouchMove, { passive: false });
    base.addEventListener("touchend", onTouchEnd, { passive: false });
    base.addEventListener("touchcancel", onTouchEnd, { passive: false });

    return () => {
      base.removeEventListener("touchstart", onTouchStart);
      base.removeEventListener("touchmove", onTouchMove);
      base.removeEventListener("touchend", onTouchEnd);
      base.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [moveKnob, resetKnob]);

  return (
    <div
      ref={baseRef}
      className="relative rounded-full select-none"
      style={{
        width: "120px",
        height: "120px",
        background: "rgba(57,255,20,0.08)",
        border: "2px solid rgba(57,255,20,0.4)",
        touchAction: "none",
      }}
    >
      {/* Crosshair guides */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.2 }}
      >
        <div style={{ width: "100%", height: "1px", background: "#39ff14" }} />
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.2 }}
      >
        <div style={{ width: "1px", height: "100%", background: "#39ff14" }} />
      </div>
      {/* Knob */}
      <div
        ref={knobRef}
        className="absolute rounded-full"
        style={{
          width: "44px",
          height: "44px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle at 40% 40%, rgba(57,255,20,0.6), rgba(57,255,20,0.2))",
          border: "2px solid #39ff14",
          boxShadow: "0 0 12px rgba(57,255,20,0.5)",
          transition: "box-shadow 0.1s",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
