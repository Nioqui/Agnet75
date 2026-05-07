import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Background from "./Background";

const ParallaxBG = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const heroStarsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const starCount = 120;
    const stars = [];

    // Initialize stars with 3D positions
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2, // Normalized -1 to 1
        y: (Math.random() - 0.5) * 2,
        z: Math.random(), // Depth 0 to 1
        size: 1 + Math.random() * 2,
        brightness: 0.5 + Math.random() * 0.5,
        color: { r: 255, g: 255, b: 255 },
      });
    }
    starsRef.current = stars;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // The Main Rendering Logic
    const render = (progress) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDist = Math.max(canvas.width, canvas.height);

      // --- PHASE 1: ALBUM (0.0 -> 0.35) — Scroll-driven parallax, no warp ---
      // warpBlend: 0 = pure parallax (album), 1 = full warp (chaos)
      // Blend starts at 0.35 (albums still visible) → full warp at 0.50
      const warpBlend = Math.max(0, Math.min(1, (progress - 0.35) / 0.15));
      const travelSpeed = progress * 8; // Used only once warpBlend > 0

      // Parallax Y offset: stars drift downward as user scrolls up through albums.
      // Tied purely to scroll progress — no time, no animation loop.
      // Fades to 0 as warp takes over at the transition.
      const parallaxY = (1 - warpBlend) * progress * 120;

      // --- PHASE 2: DEGRADATION (0.35 -> 0.55) ---
      const isDegraded = progress > 0.35;
      const degradationIntensity = isDegraded ? (progress - 0.35) / 0.2 : 0;

      // --- PHASE 3: CHAOS (0.55 -> 0.70) — Max warp + trails window ---
      const isChaos = progress > 0.55;
      let chaosIntensity = isChaos ? Math.min(1, (progress - 0.55) / 0.15) : 0;

      // --- ATMOSPHERE STABILIZATION (0.80 -> 1.0) ---
      // Reduce chaos energy and purple glow as terminal stabilizes
      if (progress > 0.8) {
        const stabilization = Math.max(0, Math.min(1, (progress - 0.8) / 0.15));
        chaosIntensity *= 1 - stabilization * 0.8;
      }

      // --- PHASE 4: CRASH (0.97 -> 1.0) — Pushed back for maximum chaos duration ---
      const isCrashed = progress > 0.97;

      if (isCrashed) {
        // Residual effect: occasional flashes
        if (Math.random() > 0.98) {
          ctx.fillStyle = "rgba(168, 85, 247, 0.05)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Briefly attempts to "come back"
        if (Math.random() > 0.99) {
          // Flash some stars briefly
        } else {
          return; // Dark screen
        }
      }

      // Trail lookahead: compute where each star was a small step ago in travelSpeed.
      // δ scales with chaosIntensity so trails are zero in album phase and grow into chaos.
      const trailDelta = chaosIntensity * 0.18;

      stars.forEach((star) => {
        // Album phase: static depth (no zoom cycling).
        // Chaos phase: z-modulated warp depth.
        // Transition: lerp between the two.
        const warpZ = (star.z - (travelSpeed % 1) + 1) % 1;
        const currentZ = star.z * (1 - warpBlend) + warpZ * warpBlend;

        const scale = 1 / (currentZ + 0.01);
        const x = centerX + star.x * scale * centerX;
        // Album: stars drift downward (scroll-driven, not time-driven).
        // Chaos: parallaxY is 0, warp z-offset takes over entirely.
        const y = centerY + star.y * scale * centerY + parallaxY;

        const s = star.size * (1 - currentZ) * 2;
        const r = 255,
          g = 255,
          b = 255;
        const alpha = (1 - currentZ) * star.brightness;

        // --- STAR TRAIL (chaos phase only) ---
        // Compute the star's screen position at travelSpeed - trailDelta
        // to get the vector from tail → head, then draw a line along it.
        if (chaosIntensity > 0) {
          const prevSpeed = travelSpeed - trailDelta;
          const prevWarpZ = (star.z - (prevSpeed % 1) + 1) % 1;
          const prevCurrentZ = star.z * (1 - warpBlend) + prevWarpZ * warpBlend;
          const prevScale = 1 / (prevCurrentZ + 0.01);
          const prevX = centerX + star.x * prevScale * centerX;
          const prevY = centerY + star.y * prevScale * centerY + parallaxY;

          // Only draw trail if the star actually moved (avoids static-phase artifacts)
          const dx = x - prevX;
          const dy = y - prevY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.5) {
            // Trail: line from tail to star body. Width and opacity scale with intensity.
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * chaosIntensity * 0.6})`;
            ctx.lineWidth = s * 0.8;
            ctx.lineCap = "round";
            ctx.stroke();
          }
        }

        // Star dot (always drawn on top of trail)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Use ScrollTrigger to drive the background
    // We use the same settings as Parallax.jsx to stay in sync
    const st = ScrollTrigger.create({
      trigger: ".parallax-main-container",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const progress = self.progress;

        // --- CROSSFADE LOGIC ---
        // Parallax stars (canvas) fade out | Static stars (hero) fade in
        // Transition window: 0.85 → 0.95
        let canvasOpacity = 1;
        let staticOpacity = 0;

        if (progress > 0.85) {
          const crossfade = Math.max(0, Math.min(1, (progress - 0.85) / 0.1));
          canvasOpacity = 1 - crossfade;
          staticOpacity = crossfade;
        }

        // --- MAIN CONTAINER VISIBILITY ---
        // Fade in at start, stay visible for terminal phase
        let containerOpacity;
        if (progress < 0.05) {
          containerOpacity = 0;
        } else if (progress < 0.15) {
          containerOpacity = (progress - 0.05) / 0.1;
        } else {
          containerOpacity = 1; // Stay visible for crossfade and terminal
        }

        if (bgRef.current) bgRef.current.style.opacity = containerOpacity;
        if (canvasRef.current) canvasRef.current.style.opacity = canvasOpacity;
        if (heroStarsRef.current)
          heroStarsRef.current.style.opacity = staticOpacity;

        render(progress);
      },
    });

    return () => {
      window.removeEventListener("resize", resize);
      st.kill();
    };
  }, []);

  return (
    <div
      ref={bgRef}
      className="parallax-bg-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1 /* Move to the absolute bottom of the stack */,
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      <div
        ref={heroStarsRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.6s ease-out",
        }}
      >
        <Background />
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 1,
          transition: "opacity 0.6s ease-out",
        }}
      />
    </div>
  );
};

export default ParallaxBG;
