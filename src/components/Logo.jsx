import React, { useRef, useEffect } from "react";
import gsap from "gsap";

export default function JesterLogo({ eyeState = "NORMAL", ...props }) {
  const pupilRef = useRef(null);
  const svgRef = useRef(null);
  const interactionState = useRef("IDLE");
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  const maskId = `eye-blink-mask-${instanceId.current}`;
  const coverId = `blink-cover-${instanceId.current}`;
  const cuteCoverId = `cute-cover-${instanceId.current}`;
  const focusTopId = `focus-top-${instanceId.current}`;
  const focusBottomId = `focus-bottom-${instanceId.current}`;
  const currentExpression = useRef("neutral");

  useEffect(() => {
    if (!pupilRef.current || !svgRef.current) return;

    let ctx = gsap.context(() => {
      let idleTimer;
      let chaosTimer;
      let idleTl = gsap.timeline();
      let chaosTl = gsap.timeline();

      // 1. BOUNDARY SAFETY LAYER
      const LIMITS = {
        x: 20.6,
        y: 12.0,
      };

      const clamp = (val, max) => Math.max(-max, Math.min(max, val));

      const getCoord = (limit, aggressive = true) => {
        let coord;
        if (!aggressive) {
          coord = (Math.random() - 0.5) * limit;
        } else {
          const rand = Math.random();
          if (rand > 0.3) {
            // Favor the edges for aggressive saccades
            coord =
              (Math.random() > 0.5 ? 1 : -1) *
              (limit * (0.6 + Math.random() * 0.4));
          } else {
            coord = (Math.random() - 0.5) * limit;
          }
        }
        return clamp(coord, limit);
      };

      const performIdleAction = () => {
        if (eyeState !== "NORMAL" || interactionState.current !== "IDLE")
          return;

        // 2. DECISION PHASE
        const modeRand = Math.random();
        // If cute, force micro-clusters or deep idle (no large saccades)
        let isMicroCluster, isSaccade;
        if (currentExpression.current === "cute") {
          isMicroCluster = modeRand < 0.6; // Higher chance for clusters
          isSaccade = false; // No large jumps
        } else {
          isMicroCluster = modeRand < 0.15;
          isSaccade = modeRand >= 0.15 && modeRand < 0.5;
        }

        // Start a non-interruptible sequence
        idleTl.clear();
        idleTl = gsap.timeline({
          onComplete: () => {
            if (interactionState.current !== "IDLE") return;
            // 3. GLOBAL DELAY / REST PHASE
            const nextWait =
              Math.random() > 0.8
                ? 3000 + Math.random() * 4000 // Long observation
                : 1200 + Math.random() * 1500; // Standard pause
            idleTimer = setTimeout(performIdleAction, nextWait);
          },
        });

        if (isMicroCluster) {
          // --- MODE: MICRO-CLUSTER (Non-interruptible sequence) ---
          const steps = Math.floor(Math.random() * 2) + 2; // 2 or 3 steps
          for (let i = 0; i < steps; i++) {
            idleTl.to(pupilRef.current, {
              x: getCoord(LIMITS.x * 0.4, false), // Small range
              y: getCoord(LIMITS.y * 0.4, false),
              duration: 0.04 + Math.random() * 0.03,
              ease: "power4.out",
              delay: i === 0 ? 0 : 0.06 + Math.random() * 0.08,
            });
          }
          idleTl.to({}, { duration: 0.15 }); // Brief stabilization
        } else if (isSaccade) {
          // --- MODE: LARGE SACCADE ---
          const targetX = getCoord(LIMITS.x, true);
          const targetY = getCoord(LIMITS.y, true);

          idleTl.to(pupilRef.current, {
            x: targetX,
            y: targetY,
            duration: 0.05 + Math.random() * 0.04,
            ease: "expo.out",
          });

          // Secondary jitter/micro-correction
          if (Math.random() > 0.6) {
            idleTl.to(pupilRef.current, {
              x: clamp(targetX + (Math.random() - 0.5) * 4, LIMITS.x),
              y: clamp(targetY + (Math.random() - 0.5) * 4, LIMITS.y),
              duration: 0.04,
              ease: "none",
            });
          }
          idleTl.to({}, { duration: 0.3 + Math.random() * 0.2 }); // Gaze hold
        } else {
          // --- MODE: IDLE OBSERVATION ---
          idleTl.to(pupilRef.current, {
            x: (Math.random() - 0.5) * 3,
            y: (Math.random() - 0.5) * 3,
            duration: 0.8,
            ease: "sine.inOut",
          });
        }

        // --- GLOBAL RULE: RETURN TO CENTER ---
        idleTl.to(pupilRef.current, {
          x: 0,
          y: 0,
          duration: 0.15 + Math.random() * 0.1,
          ease: "power2.inOut",
        });
      };

      const performChaosAction = () => {
        if (eyeState === "NORMAL" || eyeState === "FROZEN") return;

        chaosTl.clear();

        // Randomly choose between a jump, a jitter, or a stare
        const actionRand = Math.random();

        if (eyeState === "RESIDUAL" && Math.random() > 0.15) {
          chaosTimer = setTimeout(
            performChaosAction,
            1000 + Math.random() * 3000,
          );
          return;
        }

        let jumpProb = eyeState === "RESIDUAL" ? 0.9 : 0.6;

        if (actionRand < jumpProb) {
          // SUDDEN JUMP
          const jumpLimitX = LIMITS.x * (eyeState === "CHAOS" ? 1.3 : 0.5);
          const jumpLimitY = LIMITS.y * (eyeState === "CHAOS" ? 1.3 : 0.5);

          chaosTl.to(pupilRef.current, {
            x: (Math.random() - 0.5) * jumpLimitX * 2,
            y: (Math.random() - 0.5) * jumpLimitY * 2,
            duration: 0.02 + Math.random() * 0.04, // Extremely fast
            ease: "none",
            onComplete: () => {
              // Quick clamp back if overshot too much
              gsap.to(pupilRef.current, {
                x: clamp(pupilRef.current._gsap.x, LIMITS.x),
                y: clamp(pupilRef.current._gsap.y, LIMITS.y),
                duration: 0.05,
              });
            },
          });
        } else if (actionRand < 0.9) {
          // MICRO JITTER
          const jitterCount =
            eyeState === "CHAOS" ? 3 + Math.floor(Math.random() * 5) : 2;
          for (let i = 0; i < jitterCount; i++) {
            chaosTl.to(pupilRef.current, {
              x: "+=" + (Math.random() - 0.5) * 4,
              y: "+=" + (Math.random() - 0.5) * 4,
              duration: 0.02,
              ease: "none",
            });
          }
        } else {
          // STARING PHASE
          chaosTl.to({}, { duration: 0.4 + Math.random() * 0.6 });
        }

        const nextChaosDelay =
          eyeState === "RESIDUAL"
            ? 1000 + Math.random() * 2000
            : 50 + Math.random() * 200;
        chaosTimer = setTimeout(performChaosAction, nextChaosDelay);
      };

      if (eyeState === "NORMAL") {
        idleTimer = setTimeout(performIdleAction, 800);
      } else if (eyeState !== "FROZEN") {
        performChaosAction();
      }

      // --- 4. INTERACTION SYSTEM ---
      // quickTo handles the TRACKING phase state updates
      let xTo = gsap.quickTo(pupilRef.current, "x", {
        duration: 0.5,
        ease: "power3.out",
      });
      let yTo = gsap.quickTo(pupilRef.current, "y", {
        duration: 0.5,
        ease: "power3.out",
      });

      const handleMouseMove = (e) => {
        if (!svgRef.current || eyeState !== "NORMAL") return;

        const rect = svgRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);

        // Detection radius: ~40% of viewport width
        const radius = window.innerWidth * 0.4;

        if (distance < radius) {
          // Map Distance to Limits. The closer to edge of radius, the closer to limit.
          const targetX = clamp((deltaX / radius) * LIMITS.x * 1.5, LIMITS.x);
          const targetY = clamp((deltaY / radius) * LIMITS.y * 1.5, LIMITS.y);

          // === ENTERING DETECTION ZONE ===
          if (
            interactionState.current === "IDLE" ||
            interactionState.current === "RETURNING"
          ) {
            console.log(
              "STATE CHANGE:",
              interactionState.current,
              "-> ENTERING",
            );
            interactionState.current = "ENTERING";
            clearTimeout(idleTimer);
            clearTimeout(expressionTimer); // Stop random expressions
            idleTl.kill(); // Intentionally break any idle or exit running loops
            applyExpression("focused"); // Force focused state immediately

            // Phase 1: Smooth lock-on instead of snap
            gsap.to(pupilRef.current, {
              x: targetX,
              y: targetY,
              duration: 0.4,
              ease: "power3.out",
              overwrite: "auto",
              onComplete: () => {
                if (interactionState.current === "ENTERING") {
                  console.log(
                    "STATE CHANGE: ENTERING -> TRACKING - Fresh quickTo initialized",
                  );
                  interactionState.current = "TRACKING";
                  // ROOT CAUSE FIX: Re-initialize quickTo here to recover from potential overwrite: "auto" kills
                  xTo = gsap.quickTo(pupilRef.current, "x", {
                    duration: 0.5,
                    ease: "power3.out",
                  });
                  yTo = gsap.quickTo(pupilRef.current, "y", {
                    duration: 0.5,
                    ease: "power3.out",
                  });
                }
              },
            });
            // Block quick tracking logic this frame
            return;
          }

          if (interactionState.current === "ENTERING") {
            // Block real-time overrides while smooth entry plays out
            return;
          }

          // Phase 2: Resume full smooth TRACKING
          interactionState.current = "TRACKING";
          xTo(targetX);
          yTo(targetY);
        } else {
          // === LEAVE / OUTSIDE DETECTION ZONE ===
          if (
            interactionState.current === "TRACKING" ||
            interactionState.current === "ENTERING"
          ) {
            console.log(
              "STATE CHANGE:",
              interactionState.current,
              "-> RETURNING",
            );
            interactionState.current = "RETURNING";

            // Phase 3: Intentional reset
            gsap.to(pupilRef.current, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
              overwrite: "auto",
              onComplete: () => {
                if (interactionState.current === "RETURNING") {
                  console.log("STATE CHANGE: RETURNING -> IDLE");
                  interactionState.current = "IDLE";
                  // Phase 4: Think shortly, then regain autonomy
                  clearTimeout(idleTimer);
                  clearTimeout(expressionTimer);
                  applyExpression("neutral"); // Return to neutral
                  idleTimer = setTimeout(performIdleAction, 300);
                  expressionTimer = setTimeout(pickExpression, 2000);
                }
              },
            });
          }
        }
      };

      window.addEventListener("mousemove", handleMouseMove);

      // --- 5. BLINK SYSTEM (INDEPENDENT) ---
      let blinkTimer;

      const performBlink = () => {
        if (eyeState === "FROZEN" || eyeState === "COLLAPSE") return;

        const isDouble = Math.random() < 0.25;
        const mainTl = gsap.timeline({
          onComplete: scheduleNextBlink,
        });

        const createBlinkSequence = () => {
          const tl = gsap.timeline();

          let durationMod =
            eyeState === "CHAOS" ? 0.3 : eyeState === "RESIDUAL" ? 2 : 1;

          tl.to(`#${coverId}`, {
            height: 45,
            duration: (0.07 + Math.random() * 0.03) * durationMod, // Fast close
            ease: "power2.in",
          })
            .to(`#${coverId}`, {
              height: 45,
              duration: (0.05 + Math.random() * 0.03) * durationMod, // Brief hold
            })
            .to(`#${coverId}`, {
              height: 0,
              duration: (0.12 + Math.random() * 0.04) * durationMod, // Smoother open
              ease: "power2.out",
            });
          return tl;
        };

        mainTl.add(createBlinkSequence());

        if (isDouble && eyeState === "NORMAL") {
          // Double blink rules: 0.1-0.25s gap, never more than 2
          mainTl.add(
            createBlinkSequence(),
            "+=" + (0.1 + Math.random() * 0.15),
          );
        }
      };

      function scheduleNextBlink() {
        if (eyeState === "FROZEN" || eyeState === "COLLAPSE") return;

        // Base delay 2-6s
        let delay = 2 + Math.random() * 4;

        if (eyeState === "RESIDUAL") delay += 5;
        if (eyeState === "CHAOS") delay -= 1.5;

        // Slightly reduce frequency during intense tracking
        if (interactionState.current === "TRACKING") {
          delay += 1.5;
        }

        blinkTimer = gsap.delayedCall(Math.max(0.5, delay), performBlink);
      }

      // Start the blink loop
      scheduleNextBlink();

      // --- 6. EXPRESSION SYSTEM ---
      let expressionTimer;
      const applyExpression = (state) => {
        currentExpression.current = state;
        const tl = gsap.timeline();
        const duration = 0.25;
        const ease = "power2.inOut";

        // Reset
        tl.to([`#${cuteCoverId}`, `#${focusTopId}`, `#${focusBottomId}`], {
          height: 0,
          duration,
          ease,
        });
        tl.to(`#${cuteCoverId}`, { ry: 0, duration, ease }, 0);
        tl.to(
          pupilRef.current,
          { scaleY: 1, y: 0, duration, ease, transformOrigin: "center center" },
          0,
        );

        if (state === "focused") {
          tl.to(`#${focusTopId}`, { height: 5, duration, ease }, 0);
          tl.to(`#${focusBottomId}`, { height: 7, duration, ease }, 0);
          tl.to(pupilRef.current, { scaleY: 0.6, duration, ease }, 0);
        } else if (state === "cute") {
          tl.to(`#${cuteCoverId}`, { ry: 25, duration, ease }, 0);
          tl.to(pupilRef.current, { y: -9, duration, ease }, 0);
        }
        return tl;
      };

      const pickExpression = () => {
        if (eyeState !== "NORMAL" || interactionState.current !== "IDLE") {
          return;
        }

        const rand = Math.random();
        let nextState = "neutral";
        if (rand < 0.2) nextState = "focused";
        else if (rand < 0.45) nextState = "cute"; // Increased to ~25%

        applyExpression(nextState);

        const nextWait =
          nextState === "neutral"
            ? 3000 + Math.random() * 4000 // Shortened neutral wait
            : 2000 + Math.random() * 3000;

        expressionTimer = setTimeout(pickExpression, nextWait);
      };

      if (eyeState === "NORMAL") {
        expressionTimer = setTimeout(pickExpression, 5000);
      }

      return () => {
        clearTimeout(idleTimer);
        clearTimeout(chaosTimer);
        clearTimeout(expressionTimer);
        if (blinkTimer) blinkTimer.kill();
        idleTl.kill();
        chaosTl.kill();
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, svgRef);

    return () => ctx.revert();
  }, [eyeState]);

  return (
    <svg
      id="svg"
      ref={svgRef}
      viewBox="0 0 300 221.5"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <clipPath id="clip-1">
          <rect
            x="0"
            y="0"
            transform="scale(0.14648,0.14649)"
            width="2048"
            height="1512"
          />
        </clipPath>

        <mask id={maskId}>
          <rect x="0" y="0" width="300" height="221.5" fill="white" />
          {/* Blink Layer */}
          <rect
            id={coverId}
            x="120"
            y="115"
            width="60"
            height="0"
            fill="black"
          />
          {/* Expression Layers */}
          <ellipse
            id={cuteCoverId}
            cx="150"
            cy="163"
            rx="18"
            ry="0"
            fill="black"
          />
          <rect
            id={focusTopId}
            x="120"
            y="126"
            width="60"
            height="0"
            fill="black"
          />
          <rect
            id={focusBottomId}
            x="120"
            y="145"
            width="60"
            height="0"
            fill="black"
          />
        </mask>
      </defs>

      <g clipPath="url(#clip-1)">
        <g id="logo-static">
          <path
            d="M166.24219,60.14384c2.97803,-0.33826 10.10449,0.02549 13.05469,0.50775c3.04395,0.49764 10.7666,1.29794 12.62109,3.94144c1.14551,1.6318 1.57764,3.71218 0.78369,5.61851c-0.89941,2.15728 -3.30176,3.28456 -4.81641,4.9505c-5.8374,6.41486 -7.44873,14.31121 -8.65723,22.44929c9.52295,-5.99222 18.99609,-8.89809 30.26074,-9.24572c11.66455,-0.43934 23.0083,3.87127 31.43848,11.94606c2.61182,2.46404 8.55176,8.9643 8.67041,12.74958c0.06006,1.94208 -1.2041,4.10815 -2.96484,4.994c-1.80176,0.90739 -4.54395,0.79796 -6.53467,1.20756c-7.59082,1.56325 -14.99854,4.56067 -20.44629,10.14974c-7.6875,7.56631 -8.59424,17.87763 -8.11084,28.0927c0.16553,3.50855 -0.76465,7.01417 -4.95117,7.50053c-2.11816,0.24465 -4.38867,0.11866 -6.54492,0.11866l-11.7627,-0.00146l-40.69922,-0.00439l-35.34331,0.00439l-11.49053,0.00146c-2.66924,0 -6.63193,0.29152 -9.15835,-0.64311c-1.03154,-0.38235 -2.43589,-2.21939 -2.70454,-3.31371c-0.48618,-1.97914 -0.18384,-4.36408 -0.24067,-6.41793c0.0085,-4.78305 0.02285,-8.69285 -1.23999,-13.3316c-3.39902,-12.48706 -14.0896,-19.31987 -26.16826,-21.95018c-2.38652,-0.7625 -5.82964,-0.21711 -7.96377,-1.57467c-3.40913,-2.26876 -3.33032,-5.68077 -1.30518,-8.85648c15.56558,-24.41027 45.6731,-25.85309 68.83052,-11.49017c6.57539,-22.65043 21.72144,-35.80536 45.44326,-37.40274zM118.10405,137.60497c8.33379,13.81636 21.6397,17.2751 37.05806,16.04893c10.33887,-0.56107 22.14404,-6.46335 26.81689,-16.08072c-3.76611,-7.0732 -10.7666,-12.25692 -18.37061,-14.48965c-4.771,-1.40137 -9.10107,-1.78958 -14.05225,-1.68293c-1.4751,0.03179 -3.09097,-0.02915 -4.55552,0.12994c-9.14546,0.77671 -17.52495,4.11269 -23.55527,11.24684c-1.26328,1.50025 -2.38213,3.11667 -3.34131,4.82759zM117.31099,120.90003c0.12495,-3.7677 0.44707,-7.52646 0.96489,-11.26061c-8.54604,-6.8057 -19.24058,-10.33681 -30.1585,-9.95754c-8.42842,0.38001 -15.71851,3.42197 -21.73037,9.40774c11.67173,3.02878 22.54263,9.97116 28.42515,20.70893c0.81665,1.49088 0.57319,1.58595 2.22554,1.57716l11.63569,-0.01201c2.30581,-3.93397 5.08755,-7.56425 8.6376,-10.46368zM99.91069,153.82384c5.48599,0 11.38901,-0.11573 16.83794,0.00586c-3.42407,-3.16282 -6.61216,-6.99512 -8.73252,-11.1689l-8.7813,0.01289c0.72202,3.41069 0.68892,7.67823 0.67588,11.15015zM209.26904,99.68335c-11.32617,0.46366 -22.32275,4.63202 -30.45996,12.65978c0.06152,1.98281 0.19922,3.72712 0.37061,5.69586c4.89404,3.49507 9.35449,8.00843 12.25195,13.32032l12.36475,0.01553c0.33398,-0.03384 0.57568,0.02637 0.75293,-0.30749c6.22119,-11.67973 16.37402,-18.49422 29.21484,-21.9994c-7.25977,-6.67313 -14.521,-9.72476 -24.49512,-9.3846zM183.43213,153.82237l8.9751,-0.00146l7.80322,0.00439c0.00586,-3.05734 -0.0249,-8.20678 0.68115,-11.15704l-8.77588,-0.00176c-2.65137,4.79506 -4.73877,7.36898 -8.68359,11.15587zM137.87183,111.08679c9.47241,-1.70901 20.30493,-1.39815 29.57007,1.28227c-0.27686,-13.68832 0.73828,-29.0666 8.79346,-40.71337c-3.25488,-0.23293 -5.42578,-0.3428 -8.71436,-0.24479c-11.31299,0.69922 -21.09888,4.30577 -28.19912,13.53523c-6.62783,8.61521 -8.67041,18.24797 -10.1896,28.73362c3.11338,-1.24726 5.4561,-1.8599 8.73955,-2.59296z"
            fill="#fefefe"
          />
        </g>

        <path
          ref={pupilRef}
          mask={`url(#${maskId})`}
          d="M149.59131,126.1775c8.8418,-0.27907 10.45752,20.36555 0.90527,22.89698c-9.20728,-0.18898 -9.97236,-20.92237 -0.90527,-22.89698z"
          fill="#fefefe"
        />

        <path
          d="M208.51025,56.75645c6.25049,-0.8797 12.03369,3.46826 12.92578,9.71846c0.89209,6.2502 -3.44385,12.0426 -9.69141,12.94691c-6.26514,0.9068 -12.07764,-3.44453 -12.97119,-9.71201c-0.89502,-6.26763 3.46729,-12.07102 9.73682,-12.95336z"
          fill="#fefefe"
        />
        <path
          d="M265.68018,102.2974c6.28711,-0.49515 11.78906,4.18843 12.30615,10.47364c0.51563,6.28536 -4.14844,11.8041 -10.43262,12.34159c-6.31201,0.53998 -11.8623,-4.1521 -12.38232,-10.46734c-0.51855,-6.31539 4.19238,-11.8504 10.50879,-12.34789z"
          fill="#fefefe"
        />
        <path
          d="M32.66836,102.29608c6.28945,-0.4868 11.78701,4.20791 12.29121,10.49649c0.5042,6.28872 -4.17495,11.79956 -10.46177,12.32108c-6.31143,0.52372 -11.8481,-4.17818 -12.3542,-10.49137c-0.50625,-6.31334 4.21055,-11.83736 10.52476,-12.32621z"
          fill="#fefefe"
        />
      </g>
    </svg>
  );
}
