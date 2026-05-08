import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParallaxBG from "./parallaxbg";
import JesterLogoChaos from "./JesterLogoChaos";
import JesterLogo from "./Logo";
import "./parallax.css";

// Import 6 fixed albums
import Album1 from "../assets/images/albumes/5. SMOL The Sleeper.png";
import Album2 from "../assets/images/albumes/Album cover MKI.png";
import Album3 from "../assets/images/albumes/Jesters Pact.png";
import Album4 from "../assets/images/albumes/Opaqueness1.png";
import Album5 from "../assets/images/albumes/Tropical Asymetrical Forest (Cover).png";
import Album6 from "../assets/images/albumes/Ulafi Cover art.png";
import InstagramIcon from "../assets/svgs/instagram.jsx";
import SpotifyIcon from "../assets/svgs/spotify.jsx";
import YoutubeIcon from "../assets/svgs/youtube.jsx";
import XIcon from "../assets/svgs/x.jsx";
import TikTokIcon from "../assets/svgs/tiktok.jsx";
import BandcampIcon from "../assets/svgs/bandcamp.jsx";
import FacebookIcon from "../assets/svgs/facebook.jsx";
import KofiIcon from "../assets/svgs/kofi.jsx";
import ConsoleIcon from "../assets/svgs/console.jsx";
import soundManager from "../utils/SoundManager";
import TerminalEngine from "../utils/TerminalEngine";
import TwitchIcon from "../assets/svgs/twitch.jsx";

gsap.registerPlugin(ScrollTrigger);

const Parallax = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const albumRefs = useRef([]);
  const chaosRef = useRef(null);
  const chaosLogoRef = useRef(null);
  const collapseRef = useRef(null);
  const tiltRef = useRef(null);
  const screenRef = useRef(null);
  const crtLineRefs = useRef([]);
  const errorRefs = useRef([]);
  const artifactRefs = useRef([]);
  const progressRef = useRef(0);
  const phaseRef = useRef("hidden");

  // Terminal State
  const [terminalPhase, setTerminalPhase] = useState("hidden"); // hidden | reboot | ui
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [commandOutput, setCommandOutput] = useState("");
  const [isGlobalGlitch, setIsGlobalGlitch] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  useEffect(() => {
    TerminalEngine.onEvent = (event) => {
      if (event.type === "play-audio") {
        const src = event.payload.includes("%")
          ? event.payload
          : encodeURI(event.payload);
        const audio = new Audio(src);
        audio.volume = soundManager.volume * 8;
        audio.play().catch((e) => console.warn("Audio playback failed", e));
      }
    };
  }, []);

  const handleCommand = (e) => {
    if (e.key === "Enter") {
      const input = commandInput.trim();
      if (input) {
        const response = TerminalEngine.process(input);
        setCommandOutput(response);
      }
      setCommandInput("");
    }
  };

  const handleTiltMove = (e) => {
    if (phaseRef.current !== "ui" || !tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Max rotation limits
    const rotateX = -(y / (rect.height / 2)) * 1; // max 6deg vertical
    const rotateY = (x / (rect.width / 2)) * 1; // max 8deg horizontal

    tiltRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleTiltLeave = () => {
    if (!tiltRef.current) return;
    tiltRef.current.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  const bgRenderRef = useRef(null);
  const glitchTimeoutRef = useRef(null);
  const isTouchDevice = useRef(
    typeof window !== "undefined" && "ontouchstart" in window,
  );
  const isMobile = useRef(
    typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => {
    if (isMobile.current) return;
    let isMounted = true;
    const triggerRandomGlitch = () => {
      if (!isMounted) return;
      setIsGlobalGlitch(true);
      glitchTimeoutRef.current = setTimeout(
        () => {
          if (!isMounted) return;
          setIsGlobalGlitch(false);
          glitchTimeoutRef.current = setTimeout(
            triggerRandomGlitch,
            Math.random() * 6000 + 4000,
          ); // 4-10 seconds
        },
        Math.random() * 100 + 100,
      ); // 100-200ms
    };
    glitchTimeoutRef.current = setTimeout(
      triggerRandomGlitch,
      Math.random() * 6000 + 4000,
    );

    return () => {
      isMounted = false;
      clearTimeout(glitchTimeoutRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    const albums = albumRefs.current;
    const chaosState = { phase: "off" };

    const albumData = [
      { offset: 0.0, speed: 2.2, x: "15%" }, //A1 pulpo
      { offset: 0.05, speed: 2.4, x: "68%" }, //A2 maquina de escribir
      { offset: 0.1, speed: 2.2, x: "38%" }, //A3 jester pact
      { offset: 0.15, speed: 2.4, x: "82%" }, //A4 opaqueness
      { offset: 0.2, speed: 2.5, x: "78%" }, //A5 tropical asymmetry forest
      { offset: 0.25, speed: 2.8, x: "22%" }, //A6 ulafi
    ];

    const isMobile = window.innerWidth < 768;
    const titleEase = gsap.parseEase("power2.inOut");
    let cachedWidth = window.innerWidth;
    const onResize = () => {
      cachedWidth = window.innerWidth;
    };
    window.addEventListener("resize", onResize);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.4,
        onUpdate: (self) => {
          const progress = self.progress;
          progressRef.current = progress;

          // --- PHASE CONTROL ---
          if (progress < 0.48) chaosState.phase = "off";
          else if (progress < 0.52) chaosState.phase = "warmup";
          else if (progress < 0.65) chaosState.phase = "active";
          else chaosState.phase = "shutdown";

          // --- TERMINAL PHASE SWITCHING ---
          let currentPhase = "hidden";
          if (progress >= 0.76) currentPhase = "ui";
          else if (progress >= 0.65) currentPhase = "reboot";

          if (currentPhase !== phaseRef.current) {
            phaseRef.current = currentPhase;
            setTerminalPhase(currentPhase);
          }

          // --- GLITCH EFFECT ---
          if (!isMobile && progress >= 0.65 && Math.random() > 0.97 && screenRef.current) {
            screenRef.current.classList.add("glitch");
            gsap.killTweensOf(screenRef.current);
            gsap.delayedCall(0.12, () => {
              if (screenRef.current)
                screenRef.current.classList.remove("glitch");
            });
          }

          // --- STAR FREEZE ---
          if (progress > 0.7) {
            document.body.classList.add("stars-static");
          } else {
            document.body.classList.remove("stars-static");
          }

          // --- TITLE (0.15 → 0.6) ---
          if (titleRef.current) {
            const holdStart = 0.15;
            const holdEnd = 0.4;
            const titleExitEnd = 0.6;
            let titleY,
              titleOpacity = 1;

            if (progress < holdStart) {
              titleY = -60 + (progress / holdStart) * 60;
            } else if (progress < holdEnd) {
              titleY = 0;
            } else {
              const t = Math.max(
                0,
                Math.min(1, (progress - holdEnd) / (titleExitEnd - holdEnd)),
              );
              const easeT = titleEase(t);
              titleY = 0 + easeT * -190;
              titleOpacity = 1 - easeT;
            }
            titleRef.current.style.transform = `translate(-50%, calc(-50% + ${titleY}vh))`;
            titleRef.current.style.opacity = titleOpacity;
          }

          // --- CHAOS (0.45 → 0.80) ---
          if (chaosRef.current) {
            const cIn = Math.max(0, Math.min(1, (progress - 0.48) / 0.08));
            const cOut = Math.max(0, Math.min(1, (progress - 0.6) / 0.05));
            const cOpacity = Math.pow(cIn, 0.4) * (1 - Math.pow(cOut, 2.5));
            chaosRef.current.style.opacity = cOpacity;

            if (chaosLogoRef.current) {
              const intensity = cOpacity;
              if (isMobile) {
                chaosLogoRef.current.style.opacity = cOpacity;
                chaosLogoRef.current.style.transform = `translate(-50%, -50%) scale(${1 + cOpacity * 0.03})`;
              } else {
                const logoFlicker = Math.random() < 0.9 * intensity ? 0 : 1;
                const jx = (Math.random() - 0.5) * 8 * intensity;
                const jy = (Math.random() - 0.5) * 8 * intensity;
                const jr = (Math.random() - 0.5) * 2 * intensity;
                const js = 1 + (Math.random() - 0.5) * 0.04 * intensity;
                chaosLogoRef.current.style.opacity = cOpacity * logoFlicker;
                chaosLogoRef.current.style.transform = `translate(-50%, -50%) translate(${jx}px, ${jy}px) rotate(${jr}deg) scale(${js})`;
              }
            }
          }

          // --- TERMINAL / CRT (0.80 → 1.00) ---
          if (collapseRef.current) {
            if (progress >= 0.65) {
              const tProgress = (progress - 0.65) / 0.04; // Quick entry window
              const scale =
                tProgress < 1
                  ? 0.3 + Math.sin(tProgress * Math.PI * 0.5) * 0.75 // Scale with overshoot
                  : 1;
              const brightness = tProgress < 0.2 ? 2.5 : 1;

              collapseRef.current.style.opacity = 1;
              collapseRef.current.style.transform = `translate(-50%, -50%) scale(${Math.min(scale, 1.05)})`;
              collapseRef.current.style.filter = `brightness(${brightness})`;
              collapseRef.current.style.pointerEvents = "all";

              if (currentPhase === "reboot") {
                const rebootProgress = (progress - 0.65) / 0.11;
                const appearGates = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
                const disappearGates = [
                  0.75, 0.77, 0.79, 0.81, 0.83, 0.85, 0.87,
                ]; // Collapse upward

                crtLineRefs.current.forEach((el, i) => {
                  if (el && i < 7) {
                    if (rebootProgress < appearGates[i]) {
                      el.style.transform = `translateY(8px)`;
                      el.style.opacity = 0;
                    } else if (rebootProgress > disappearGates[i]) {
                      el.style.transform = `translateY(-15px)`;
                      el.style.opacity = 0;
                    } else {
                      el.style.transform = `translateY(0)`;
                      el.style.opacity = 1;
                    }
                  }
                });
              }

              // Phase Glitch Transition (very short flicker between reboot and UI)
              if (!isMobile && progress >= 0.755 && progress <= 0.765 && screenRef.current) {
                screenRef.current.classList.add("glitch-transition");
              } else if (screenRef.current) {
                screenRef.current.classList.remove("glitch-transition");
              }
            } else {
              collapseRef.current.style.opacity = 0;
              collapseRef.current.style.pointerEvents = "none";
            }
          }

          // --- ALBUM MOVEMENT ---
          albums.forEach((album, i) => {
            if (!album) return;
            const data = albumData[i];
            const adjustedProgress = Math.max(
              0,
              Math.min(1, (progress - data.offset) * data.speed),
            );
            const xPercent = parseFloat(data.x);
            const margin = isMobile ? 20 : 5;
            const responsiveX = margin + (xPercent / 100) * (100 - 2 * margin);

            const y = 130 + (-180 - 130) * adjustedProgress;
            album.style.transform = `translate(${responsiveX}vw, ${y}vh) translate(-50%, 0)`;
            album.style.opacity =
              adjustedProgress > 0 && adjustedProgress < 1 ? 1 : 0;
          });

          // --- BACKGROUND RENDER ---
          bgRenderRef.current?.(progress);
        },
      });
      const errors = {
        short: [
          "ERR 0xA43F",
          "BOOT FAIL",
          "NO SIGNAL",
          "STACK FAULT",
          "DEVICE LOST",
          "BUS ERR",
        ],
        medium: [
          "MEMORY FAILURE AT 0xA43F",
          "STACK OVERFLOW DETECTED",
          "DEVICE NOT RESPONDING",
          "PARITY CHECK FAILED",
        ],
      };

      const spawnElement = () => {
        if (chaosState.phase !== "active") {
          if (chaosState.phase === "shutdown") return;
          gsap.delayedCall(0.3, spawnElement);
          return;
        }
        const isError = Math.random() > 0.4;
        const pool = isError ? errorRefs.current : artifactRefs.current;
        const el = pool[Math.floor(Math.random() * pool.length)];

        if (el && (el.style.opacity === "0" || !el.style.opacity)) {
          el.style.left = Math.random() * 100 + "%";
          el.style.top = Math.random() * 100 + "%";
          el.style.transform = "none";
          el.style.zIndex = Math.random() > 0.5 ? 15 : 40;

          if (isError) {
            const r = Math.random();
            const msg =
              r < 0.4
                ? errors.medium[
                    Math.floor(Math.random() * errors.medium.length)
                  ]
                : errors.short[Math.floor(Math.random() * errors.short.length)];
            el.innerText = msg;

            el.style.fontSize =
              (r < 0.4 ? Math.random() * 6 + 22 : Math.random() * 4 + 18) +
              "px";
            el.style.opacity = "1";
            gsap.delayedCall(Math.random() * 1.0 + 0.6, () => {
              el.style.opacity = "0";
            });
          } else {
            el.style.width = Math.random() * 200 + 50 + "px";
            el.style.height = Math.random() * 80 + 20 + "px";
            el.style.opacity = "1";
            gsap.delayedCall(Math.random() * 0.7 + 0.6, () => {
              el.style.opacity = "0";
            });
          }
        }
        gsap.delayedCall(Math.random() * 0.1 + 0.1, spawnElement);
      };

      if (!isMobile) spawnElement();
    }, containerRef);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  const albumImages = [Album1, Album2, Album3, Album4, Album5, Album6];

  return (
    <div ref={containerRef} className="parallax-main-container">
      <ParallaxBG renderRef={bgRenderRef} />

      <div className="parallax-viewport">
        <h1 ref={titleRef} className="parallax-main-title">
          A peculiar and ever evolving brand of madness.
        </h1>

        {albumImages.map((img, i) => (
          <div
            key={i}
            ref={(el) => (albumRefs.current[i] = el)}
            className={`parallax-album album-${i + 1}`}
          >
            <img src={img} alt={`Album ${i + 1}`} />
          </div>
        ))}

        <div ref={chaosLogoRef} className="chaos-logo-wrapper">
          <JesterLogoChaos className="chaos-logo" />
          <div ref={chaosRef} className="chaos-layer-internal">
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                ref={(el) => (errorRefs.current[i] = el)}
                className="chaos-error"
                style={{ opacity: 0 }}
              >
                ERROR 0xA43F
              </span>
            ))}
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                ref={(el) => (artifactRefs.current[i] = el)}
                className="chaos-artifact"
                style={{
                  opacity: 0,
                  backgroundColor: i % 2 === 0 ? "#00ff88" : "#a855f7",
                }}
              />
            ))}
          </div>
        </div>
        <div
          className={`terminal-atmosphere-overlay ${terminalPhase !== "hidden" ? "visible" : ""}`}
        />
        <div
          ref={collapseRef}
          className="crt-container"
          {...(isTouchDevice.current
            ? {}
            : { onMouseMove: handleTiltMove, onMouseLeave: handleTiltLeave })}
        >
          <div ref={tiltRef} className="crt-tilt-layer">
            <div
              ref={screenRef}
              className={`crt-screen ${isGlobalGlitch ? "global-glitch-active" : ""}`}
            >
              {terminalPhase === "reboot" && (
                <div className="reboot-sequence">
                  <p
                    ref={(el) => (crtLineRefs.current[0] = el)}
                    className="crt-line"
                  >
                    BOOTING SYSTEM...
                  </p>
                  <p
                    ref={(el) => (crtLineRefs.current[1] = el)}
                    className="crt-line"
                  >
                    RECOVERING SIGNAL...
                  </p>
                  <p
                    ref={(el) => (crtLineRefs.current[2] = el)}
                    className="crt-line"
                  >
                    INITIALIZING MEMORY...
                  </p>
                  <p
                    ref={(el) => (crtLineRefs.current[3] = el)}
                    className="crt-line"
                  >
                    REBUILDING MODULES...
                  </p>
                  <p
                    ref={(el) => (crtLineRefs.current[4] = el)}
                    className="crt-line"
                  >
                    LOADING INTERFACE...
                  </p>
                  <p
                    ref={(el) => (crtLineRefs.current[5] = el)}
                    className="crt-line"
                  >
                    SYSTEM ONLINE
                  </p>
                  <p
                    ref={(el) => (crtLineRefs.current[6] = el)}
                    className="crt-line"
                  >
                    ALL SYSTEMS STABLE
                  </p>
                </div>
              )}

              {terminalPhase === "ui" && (
                <div className="terminal-main-content">
                  {isCommandMode ? (
                    <div className="command-mode">
                      <div
                        className="command-back"
                        onClick={() => setIsCommandMode(false)}
                        onMouseEnter={() => soundManager.playHover()}
                      >
                        <span className="terminal-link-inner">
                          &gt; volver al menu
                        </span>
                      </div>
                      <div className="command-input-line">
                        <span>&gt; </span>
                        <input
                          autoFocus
                          className="command-input"
                          value={commandInput}
                          onChange={(e) => {
                            setCommandInput(e.target.value);
                            soundManager.playTypeClick();
                          }}
                          onKeyDown={handleCommand}
                        />
                      </div>
                      {commandOutput && (
                        <div className="command-output">{commandOutput}</div>
                      )}
                    </div>
                  ) : (
                    <div className="terminal-layout">
                      <div className="terminal-left">
                        <div className="terminal-header">J.U. Terminal</div>
                        <div className="terminal-body">
                          <p>SYSTEM RECOVERED</p>
                          <p>SIGNAL RESTORED</p>
                        </div>
                        <div className="terminal-socials">
                          {[
                            {
                              name: "INSTAGRAM",
                              prefix: "[IG::NODE]",
                              url: "https://www.instagram.com/agnet_75",
                            },
                            {
                              name: "SPOTIFY",
                              prefix: "[SP::STREAM]",
                              url: "https://open.spotify.com/artist/43dJhX4trs9yOkJXdGfQxV",
                            },
                            {
                              name: "YOUTUBE",
                              prefix: "[YT::FEED]",
                              url: "https://www.youtube.com/@Agnet75",
                            },
                            {
                              name: "X",
                              prefix: "[X::LINK]",
                              url: "https://x.com/Agnet75",
                            },
                            {
                              name: "TIKTOK",
                              prefix: "[TK::BYTE]",
                              url: "https://www.tiktok.com/@agnet75",
                            },
                            {
                              name: "BANDCAMP",
                              prefix: "[BC::WAVE]",
                              url: "https://agnet75.bandcamp.com",
                            },
                            {
                              name: "KO-FI",
                              prefix: "[KF::CORE]",
                              url: "https://ko-fi.com/agnet",
                            },
                            {
                              name: "FACEBOOK",
                              prefix: "[FB::NET]",
                              url: "https://www.facebook.com/Agnet75",
                            },
                            {
                              name: "TWITCH",
                              prefix: "[TW::LIVE]",
                              url: "https://www.twitch.tv/agnet75",
                            },
                          ].map((social) => (
                            <a
                              key={social.name}
                              href={social.url}
                              target="_blank"
                              className="terminal-link"
                              onMouseEnter={() => {
                                setHoveredSocial(social.name.toLowerCase());
                                soundManager.playHover();
                              }}
                              onMouseLeave={() => setHoveredSocial(null)}
                            >
                              <span className="terminal-link-inner">
                                &gt; {social.prefix} {social.name}
                              </span>
                            </a>
                          ))}
                        </div>
                        <div
                          className="terminal-command-btn"
                          onClick={() => setIsCommandMode(true)}
                          onMouseEnter={() => {
                            setHoveredSocial("command");
                            soundManager.playHover();
                          }}
                          onMouseLeave={() => setHoveredSocial(null)}
                        >
                          <span className="terminal-link-inner">
                            &gt; command
                          </span>
                        </div>
                      </div>
                      <div className="terminal-right">
                        <div
                          className={`logo-container ${hoveredSocial ? "show-social" : ""}`}
                        >
                          <JesterLogoChaos
                            className={`chaos-logo main-logo ${isGlobalGlitch ? "" : "hidden-logo"}`}
                            style={{ width: "250px" }}
                          />
                          <JesterLogo
                            className={`chaos-logo main-logo ${isGlobalGlitch ? "hidden-logo" : ""} ${hoveredSocial ? "hidden" : ""}`}
                            style={{ width: "250px" }}
                          />
                          <div
                            className={`social-icon-wrapper ${hoveredSocial ? "visible" : ""}`}
                          >
                            {hoveredSocial === "instagram" && <InstagramIcon />}
                            {hoveredSocial === "spotify" && <SpotifyIcon />}
                            {hoveredSocial === "youtube" && <YoutubeIcon />}
                            {hoveredSocial === "x" && <XIcon />}
                            {hoveredSocial === "tiktok" && <TikTokIcon />}
                            {hoveredSocial === "bandcamp" && <BandcampIcon />}
                            {hoveredSocial === "facebook" && <FacebookIcon />}
                            {hoveredSocial === "ko-fi" && <KofiIcon />}
                            {hoveredSocial === "command" && <ConsoleIcon />}
                            {hoveredSocial === "twitch" && <TwitchIcon />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parallax;
