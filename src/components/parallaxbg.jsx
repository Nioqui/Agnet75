import React, { useEffect, useRef } from "react";
import Background from "./Background";

const ParallaxBG = ({ renderRef }) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const bgRef = useRef(null);
  const heroStarsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 60 : 120;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: Math.random(),
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

    const render = (progress) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDist = Math.max(canvas.width, canvas.height);

      const warpBlend = Math.max(0, Math.min(1, (progress - 0.40) / 0.16));
      const travelSpeed = progress * 8;
      const parallaxY = (1 - warpBlend) * progress * 120;

      const isDegraded = progress > 0.40;
      const degradationIntensity = isDegraded ? (progress - 0.40) / 0.08 : 0;

      const isChaos = progress > 0.48;
      let chaosIntensity = isChaos ? Math.min(1, (progress - 0.48) / 0.08) : 0;

      if (progress > 0.60) {
        const stabilization = Math.max(0, Math.min(1, (progress - 0.60) / 0.12));
        chaosIntensity *= 1 - stabilization * 0.8;
      }

      const isCrashed = progress > 0.72;

      if (isCrashed) {
        if (!isMobile && Math.random() > 0.98) {
          ctx.fillStyle = "rgba(168, 85, 247, 0.05)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (Math.random() > 0.99) {
        } else {
          return;
        }
      }

      stars.forEach((star) => {
        const warpZ = (star.z - (travelSpeed % 1) + 1) % 1;
        const currentZ = star.z * (1 - warpBlend) + warpZ * warpBlend;

        const scale = 1 / (currentZ + 0.01);
        const x = centerX + star.x * scale * centerX;
        const y = centerY + star.y * scale * centerY + parallaxY;

        const s = star.size * (1 - currentZ) * 2;
        const r = 255, g = 255, b = 255;
        const alpha = (1 - currentZ) * star.brightness;

        if (!isMobile && chaosIntensity > 0) {
          const trailDelta = chaosIntensity * 0.18;
          const prevSpeed = travelSpeed - trailDelta;
          const prevWarpZ = (star.z - (prevSpeed % 1) + 1) % 1;
          const prevCurrentZ = star.z * (1 - warpBlend) + prevWarpZ * warpBlend;
          const prevScale = 1 / (prevCurrentZ + 0.01);
          const prevX = centerX + star.x * prevScale * centerX;
          const prevY = centerY + star.y * prevScale * centerY + parallaxY;
          const dx = x - prevX;
          const dy = y - prevY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.5) {
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * chaosIntensity * 0.6})`;
            ctx.lineWidth = s * 0.8;
            ctx.lineCap = "round";
            ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      });

      let canvasOpacity = 1;
      let staticOpacity = 0;

      if (progress > 0.68) {
        const crossfade = Math.max(0, Math.min(1, (progress - 0.68) / 0.08));
        canvasOpacity = 1 - crossfade;
        staticOpacity = crossfade;
      }

      let containerOpacity;
      if (progress < 0.05) {
        containerOpacity = 0;
      } else if (progress < 0.15) {
        containerOpacity = (progress - 0.05) / 0.1;
      } else {
        containerOpacity = 1;
      }

      if (bgRef.current) bgRef.current.style.opacity = containerOpacity;
      if (canvasRef.current) canvasRef.current.style.opacity = canvasOpacity;
      if (heroStarsRef.current)
        heroStarsRef.current.style.opacity = staticOpacity;
    };

    renderRef.current = render;

    return () => {
      window.removeEventListener("resize", resize);
      renderRef.current = null;
    };
  }, [renderRef]);

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
        zIndex: -1,
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
