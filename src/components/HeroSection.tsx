/**
 * HeroSection — cinematic scroll-driven hero.
 *
 * Animation architecture:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. MOUNT TIMELINE (gsap.timeline)
 *    - Headline letters stagger in  (opacity 0→1, y 40→0, power3.out)
 *    - Stats fade in one-by-one after headline completes
 *
 * 2. SCROLL TIMELINE (ScrollTrigger + scrub)
 *    - Section is PINNED for the full scroll distance
 *    - Car image:   x  -60vw→+60vw  (left-to-right drive)
 *                   scale 0.9→1.15
 *                   rotateY subtle (perspective depth)
 *                   translateZ for cinematic depth pop
 *    - Headline:    opacity 1→0, scale 1→0.88, translateZ 0→-120px
 *    - Stats:       staggered y parallax  (y 0 → -40 or +40)
 *    - Background:  gradient shift via CSS custom property tween
 *
 * Performance notes:
 *    - Only transform + opacity animated (no layout)
 *    - will-change / backface-visibility via .gpu-promote
 *    - All triggers killed on unmount
 * ─────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StatsBlock from "./StatsBlock";
import ScrollVisual from "./ScrollVisual";

gsap.registerPlugin(ScrollTrigger);

// Headline text — each character becomes a <span>
const HEADLINE = "WELCOME ITZFIZZ";

/**
 * Splits a string into individual <span> elements per character.
 * Spaces rendered as non-breaking spaces with reduced width.
 */
function SplitHeadline({
  text,
  charRefs,
}: {
  text: string;
  charRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
}) {
  const chars = text.split("");
  return (
    <>
      {chars.map((ch, i) => (
        <span
          key={i}
          ref={(el) => {
            charRefs.current[i] = el;
          }}
          className="gpu-promote inline-block"
          aria-hidden={ch === " "}
          style={{ opacity: 0 }} /* GSAP will animate to 1 */
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </>
  );
}

const HeroSection: React.FC = () => {
  /* ── Refs ──────────────────────────────────────────────────── */
  const sectionRef    = useRef<HTMLElement>(null);
  const headlineRef   = useRef<HTMLHeadingElement>(null);
  const charRefs      = useRef<(HTMLSpanElement | null)[]>([]);
  const visualRef     = useRef<HTMLDivElement>(null);
  const accentLineRef = useRef<HTMLDivElement>(null);
  const subtitleRef   = useRef<HTMLParagraphElement>(null);
  const labelRef      = useRef<HTMLParagraphElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // Four stat card refs
  const stat0 = useRef<HTMLDivElement>(null);
  const stat1 = useRef<HTMLDivElement>(null);
  const stat2 = useRef<HTMLDivElement>(null);
  const stat3 = useRef<HTMLDivElement>(null);
  const statRefs = [stat0, stat1, stat2, stat3];

  /* ── Animations ────────────────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Filter out null spans (spaces) */
      const letters = charRefs.current.filter(Boolean);
      const stats   = statRefs.map((r) => r.current).filter(Boolean);

      /* ── 1. MOUNT TIMELINE ─────────────────────────────────── */
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Label slide down + fade in
      tl.fromTo(
        labelRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        0
      );

      // Accent line draw-in
      tl.fromTo(
        accentLineRef.current,
        { scaleX: 0, transformOrigin: "left center", opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.6 },
        0.3
      );

      // Headline letters stagger in
      tl.fromTo(
        letters,
        { opacity: 0, y: 44, rotateX: -30 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power3.out",
        },
        0.2
      );

      // Subtitle fade
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3"
      );

      // Stats stagger in after headline
      tl.fromTo(
        stats,
        { opacity: 0, y: 30, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.2"
      );

      // Car slides in from right on load
      tl.fromTo(
        visualRef.current,
        { x: "30%", opacity: 0, scale: 0.88 },
        { x: "0%", opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" },
        0.4
      );

      // Scroll hint fades in last
      tl.fromTo(
        scrollHintRef.current,
        { opacity: 0, y: 10 },
        { opacity: 0.5, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.2"
      );

      /* ── 2. SCROLL TIMELINE ────────────────────────────────── */

      /**
       * PINNED scroll sequence.
       * The section is pinned for 250vh of scroll distance,
       * giving GSAP a long runway to spread the animations.
       */
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger:   sectionRef.current,
          start:     "top top",
          end:       "+=250%",        // 250vh of scroll travel
          pin:       true,            // pin section in viewport
          scrub:     1.4,             // smooth inertia (higher = more lag)
          anticipatePin: 1,
        },
      });

      /* ── Car horizontal drive ───────────────────────────────
         Starts centered, drives left-to-right off screen.
         rotateY adds perspective depth illusion.
         translateZ pops it toward viewer mid-animation (clamped).    */
      scrollTl
        .to(
          visualRef.current,
          {
            x:        "clamp(-60vw, 62vw, 62vw)",
            scale:    gsap.utils.clamp(0.9, 1.18, 1.18),
            rotateY:  "-8deg",
            z:        80,             // push toward viewer
            opacity:  1,
            ease:     "none",         // linear for scrub (GSAP handles easing via scrub)
            duration: 1,
          },
          0
        );

      /* ── Headline subtle depth recession (stays visible) ── */
      scrollTl
        .to(
          letters,
          {
            scale:    0.92,
            z:        -40,
            stagger:  0.01,
            ease:     "none",
            duration: 0.6,
          },
          0
        );

      /* ── Stats parallax — alternating up/down (stay visible) */
      stats.forEach((el, i) => {
        const direction = i % 2 === 0 ? -25 : 25;
        scrollTl.to(
          el,
          {
            y:        direction,
            ease:     "none",
            duration: 0.5,
          },
          i * 0.04
        );
      });

    }, sectionRef); // scoped to section

    return () => ctx.revert(); // clean up all triggers + tweens on unmount
  }, []);

  return (
    /**
     * Section is `relative` + `overflow-hidden`.
     * Height is 100vh — ScrollTrigger pins it during scroll.
     * `scanlines` adds the subtle texture overlay.
     * `perspective-hero` activates CSS perspective for 3-D transforms.
     */
    <section
      ref={sectionRef}
      className="
        relative overflow-hidden
        h-screen
        hero-gradient scanlines perspective-hero
        flex flex-col items-center justify-center
      "
    >
      {/* ── Ambient glow orbs (CSS-only, no JS) ────────────── */}
      <div
        aria-hidden
        className="
          absolute -top-32 -left-32
          w-[600px] h-[600px] rounded-full
          animate-glow-pulse
          pointer-events-none
        "
        style={{
          background:
            "radial-gradient(circle, hsl(var(--neon-orange) / 0.08) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="
          absolute -bottom-40 -right-40
          w-[700px] h-[700px] rounded-full
          animate-glow-pulse
          pointer-events-none
        "
        style={{
          background:
            "radial-gradient(circle, hsl(var(--neon-blue) / 0.07) 0%, transparent 70%)",
          animationDelay: "2s",
        }}
      />

      {/* ── Content layer ───────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">

        {/* Label */}
        <p
          ref={labelRef}
          className="text-xs tracking-[0.4em] uppercase text-muted-foreground font-medium"
          style={{ opacity: 0 }}
        >
          Performance  ·  Precision  ·  Power
        </p>

        {/* Accent line */}
        <div ref={accentLineRef} className="accent-line w-48 gpu-promote" />

        {/* Headline — split per character */}
        <h1
          ref={headlineRef}
          className="
          hero-headline-text
            text-foreground
            gpu-promote whitespace-nowrap
          "
          style={{ transformStyle: "preserve-3d" }}
          aria-label="Welcome ITZFIZZ"
        >
          <SplitHeadline text={HEADLINE} charRefs={charRefs} />
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-sm md:text-base tracking-widest uppercase text-muted-foreground max-w-md"
          style={{ opacity: 0 }}
        >
          Engineered for those who demand the extraordinary
        </p>

        {/* Stats */}
        <StatsBlock statRefs={statRefs} />
      </div>

      {/* ── Car / scroll visual ─────────────────────────────── */}
      <ScrollVisual visualRef={visualRef} />

      {/* ── Bottom scroll indicator ─────────────────────────── */}
      <div ref={scrollHintRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2" style={{ opacity: 0 }}>
        <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Scroll
        </span>
        <div
          className="w-px h-8"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--neon-orange)), transparent)",
          }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
