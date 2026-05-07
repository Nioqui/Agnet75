import React, { useEffect, useState } from "react";
import JesterLogo from "./Logo";
import "./SiteIntro.css";

const SiteIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const loadingTexts = [
    "initializing system...",
    "loading encrypted environment...",
    "establishing secure connection...",
    "boot sequence initiated...",
  ];

  useEffect(() => {
    const timers = [];

    // Cycle through loading texts
    loadingTexts.forEach((_, i) => {
      timers.push(setTimeout(() => setPhase(i + 1), (i + 1) * 800));
    });

    // Start leaving animation
    timers.push(
      setTimeout(() => setIsLeaving(true), loadingTexts.length * 800 + 2000),
    );

    // Final unmount after animation
    timers.push(
      setTimeout(() => onComplete(), loadingTexts.length * 800 + 3200),
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`site-intro-overlay ${isLeaving ? "leaving" : ""}`}>
      <div className="intro-content">
        <JesterLogo className="intro-logo" />
        <div className="intro-text-container">
          <div className="intro-text-main">
            {phase > 0
              ? loadingTexts[Math.min(phase - 1, loadingTexts.length - 1)]
              : "powering on..."}
          </div>
          <div className="intro-text-sub">
            <p>
              Nothing in the Jester Universe is by chance. Everything is a clue.
            </p>
            <p>put the music for a better experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteIntro;
