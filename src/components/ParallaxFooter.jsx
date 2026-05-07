import { useEffect, useRef } from "react";
import "./ParallaxFooter.css";

const ParallaxFooter = () => {
  const glitchRef = useRef(null);

  useEffect(() => {
    let timeout;

    const scheduleGlitch = () => {
      // Wait a random interval (2–8 seconds), then fire a brief glitch
      const wait = 2000 + Math.random() * 6000;
      timeout = setTimeout(() => {
        if (!glitchRef.current) return;
        glitchRef.current.classList.add("pf-glitching");
        // Remove after 80–160ms
        setTimeout(() => {
          glitchRef.current?.classList.remove("pf-glitching");
          scheduleGlitch(); // schedule next
        }, 80 + Math.random() * 80);
      }, wait);
    };

    scheduleGlitch();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="parallax-footer-section">
      <div className="pf-inner">
        <div ref={glitchRef} className="pf-brand">
          <h2 className="pf-title">SIGNAL LOST</h2>
          <p className="pf-subtitle">CRAZY JESTER // VOID_STATION_01</p>
        </div>

        <p className="pf-status">
          SYSTEM_OFFLINE &nbsp;·&nbsp; RESIDUAL DATA PRESERVED &nbsp;·&nbsp; v4.0.5-final
        </p>
      </div>
    </section>
  );
};

export default ParallaxFooter;
