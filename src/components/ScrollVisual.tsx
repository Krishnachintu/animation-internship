/**
 * ScrollVisual — the car image that drives horizontally on scroll.
 * The outer wrapper carries the GSAP scroll target ref.
 */
import React from "react";
import heroCar from "@/assets/hero-car.jpg";

interface ScrollVisualProps {
  visualRef: React.RefObject<HTMLDivElement>;
}

const ScrollVisual: React.FC<ScrollVisualProps> = ({ visualRef }) => {
  return (
    /* Overflow hidden wrapper keeps the car clipped during horizontal travel */
    <div className="absolute inset-x-0 bottom-0 top-[40%] overflow-hidden pointer-events-none">
      {/* Neon ground reflection */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--neon-orange) / 0.12), transparent)",
        }}
      />

      {/* Car image — GSAP moves this element */}
      <div
        ref={visualRef}
        className="gpu-promote absolute bottom-0 w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        <img
          src={heroCar}
          alt="ITZ FIZZ performance vehicle"
          draggable={false}
          className="
            block
            w-[75vw] max-w-[1000px]
            mx-auto
            object-contain
            select-none
          "
          style={{ filter: "drop-shadow(0 0 60px hsl(var(--neon-orange) / 0.25))" }}
        />
      </div>
    </div>
  );
};

export default ScrollVisual;
