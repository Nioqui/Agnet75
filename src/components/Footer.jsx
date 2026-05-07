import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import JesterLogo from "./Logo";
import "./Footer.css";

const Footer = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const eyeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle pulse for the "Void" background
      gsap.to(containerRef.current, {
        backgroundColor: "#05000a",
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Abstract Typography Flicker
      gsap.to(textRef.current, {
        opacity: 0.15,
        duration: 0.1,
        repeat: -1,
        repeatDelay: Math.random() * 5,
        yoyo: true,
        ease: "none"
      });

      // Eye Floating Breath
      gsap.to(eyeRef.current, {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer className="experimental-footer" ref={containerRef}>
      <div className="void-depth">
        <div className="void-signal-layer"></div>
        
        <div className="void-center" ref={eyeRef}>
          {/* The Eye is no longer chaotic here. It has found peace in the void. */}
          <JesterLogo chaosMode={false} className="void-eye" />
        </div>

        <div className="void-narrative">
          <p ref={textRef} className="void-phrase">
            T H E &nbsp; J E S T E R &nbsp; S L E E P S &nbsp; B U T &nbsp; N E V E R &nbsp; C L O S E S &nbsp; H I S &nbsp; E Y E S
          </p>
        </div>

        <div className="void-system-state">
          <span className="state-indicator pulsed"></span>
          <span className="state-label">FRAGMENTED // SESSION END</span>
        </div>

        <div className="void-legal">
            <p>© {new Date().getFullYear()} — EXPERIMENT COMPLETE</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
