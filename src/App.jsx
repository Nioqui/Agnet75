import "./App.css";
import React, { useEffect, useRef } from "react";
import { motion as Motion } from "motion/react";
import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import TextTypeCFG from "./components/TextTypeCFG";
import Background from "./components/Background";
import TitleLogo from "./assets/images/logo-blanco-letra.png";
import RotatingTextCFG from "./components/RotatingTextCFG";
import Parallax from "./components/parallax";
import useScrollColor from "./hooks/useScrollColor";
import Header from "./components/Header";
import NavOverlay from "./components/NavOverlay";
import SystemAudio from "./components/SystemAudio";
import ScrollReveal from "./components/ScrollReveal";
import JesterLogo from "./components/Logo";
import GradientTextCFG from "./components/GradientTextCFG";

import SiteIntro from "./components/SiteIntro";

const SITE_INTRO_SUBTEXT = "system integrity check pending...";

function App() {
  const lenisRef = useRef();
  const pageRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showIntro, setShowIntro] = React.useState(true);

  // Scroll-based background transition: #000000 (Black) → #1a0b2e (Purple)
  useScrollColor({
    startColor: "#000000",
    endColor: "#1a0b2e",
    trigger: ".wrapper",
    endTrigger: ".parallax-main-container",
    start: "top top",
    end: "bottom bottom",
    targetRef: pageRef,
  });

  useEffect(() => {
    function update(time) {
      if (lenisRef.current?.lenis) {
        lenisRef.current.lenis.raf(time * 1000);
      }
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  useEffect(() => {
    const logoSectionTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#logo-section",
        start: "bottom 90%",
        end: "bottom 10%",
        scrub: 1,
      },
    });

    logoSectionTl.to("#logo-section", {
      filter: "blur(8px)",
      opacity: 0,
      scale: 0.95,
      ease: "power1.inOut",
    });

    return () => {
      logoSectionTl.scrollTrigger?.kill();
      logoSectionTl.kill();
    };
  }, []);

  return (
    <>
      {showIntro && (
        <SiteIntro 
          subtext={SITE_INTRO_SUBTEXT} 
          onComplete={() => setShowIntro(false)} 
        />
      )}
      <ReactLenis
        root
      ref={lenisRef}
      autoRaf={false}
      onScroll={ScrollTrigger.update}
      options={{ lerp: 0.1, duration: 1.4, smoothWheel: true }}
    >
      <Header
        onPowerOff={() => {
          if (lenisRef.current?.lenis) {
            lenisRef.current.lenis.scrollTo("bottom", {
              duration: 2.5,
              easing: (t) => 1 - Math.pow(1 - t, 5), // Super smooth quint easing
            });
          }
        }}
      />
      <NavOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div ref={pageRef} className="page-bg">
        <div className="wrapper">
          <Background />
          <div className="hero-content">
            <img src={TitleLogo} className="hero-logo" alt="Logo" />

            <Motion.div
              className="hero-subtitle-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              <p className="hero-subtitle">
                <span className="purpletext">Crazy Jester</span>, mad scientist
                of music
                <span className="textgap">
                  <RotatingTextCFG />
                </span>
              </p>
            </Motion.div>
          </div>
        </div>
        <div id="logo-section">
          <div className="section-title" id="main-content">
            <div>
              {!showIntro && (
                <TextTypeCFG />
              )}
            </div>
          </div>
          <section className="reveal-section">
            <div className="section-layout">
              <div className="reveal-container">
                <div className="reveal-left">
                  <ScrollReveal
                    baseOpacity={0.15}
                    enableBlur={true}
                    blurStrength={10}
                  >
                    When music begins to play, a mix of physical and emotional
                    reactions comes to life. From simple air vibrations to how
                    our brain interprets them, every sound can spark feelings
                    like joy or nostalgia. Every song holds a small journey
                    within it. Each chord and texture creates a bond between the
                    composer and the listener. Music can transport us to
                    different places, moments and sensations if we let ourselves
                    follow its flow.
                  </ScrollReveal>
                </div>

                <div className="reveal-right">
                  <div className="container">
                    <ScrollReveal
                      baseOpacity={0.15}
                      enableBlur={true}
                      blurStrength={15}
                      trigger=".reveal-container"
                      start="top 90%"
                      end="bottom 10%"
                    >
                      <Motion.div
                        className="reveal-logo-wrapper"
                        animate={{
                          y: [0, -15, 0],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <JesterLogo className="reveal-logo" />
                        <div className="reveal-logo-glow"></div>
                      </Motion.div>
                    </ScrollReveal>
                  </div>
                </div>
              </div>
            </div>

            <div className="final-text-container">
              <ScrollReveal
                baseOpacity={0.15}
                enableBlur={true}
                blurStrength={12}
                textClassName="highlight"
              >
                <GradientTextCFG />
              </ScrollReveal>
            </div>
          </section>
        </div>
        <Parallax />
      </div>
      {/* end page-bg */}
      <SystemAudio />
    </ReactLenis>
    </>
  );
}

export default App;
