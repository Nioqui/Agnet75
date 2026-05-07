import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  trigger = null,
  start = "top 85%",
  end = "bottom 15%",
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    if (typeof children !== "string") {
      return (
        <span className="word" style={{ display: "inline-block" }}>
          {children}
        </span>
      );
    }
    const text = children ? children.toString() : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    const triggers = [];
    const wordElements = el.querySelectorAll(".word");

    // Pure Focal ScrollReveal Animation
    // Elements reveal/dim based on viewport position.
    // Includes a visibility duration plateau for section-wide visibility.
    wordElements.forEach((word) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger || word,
          scroller,
          start: start,
          end: end,
          scrub: true,
        },
      });

      tl.fromTo(
        word,
        {
          opacity: baseOpacity,
          filter: enableBlur ? `blur(${blurStrength}px)` : "none",
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          duration: 0.1, // Entrance
        },
      )
        .to(word, {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.8, // Duration plateau (Stay visible)
        })
        .to(word, {
          opacity: baseOpacity,
          filter: enableBlur ? `blur(${blurStrength}px)` : "none",
          ease: "none",
          duration: 0.1, // Exit
        });

      triggers.push(tl);
    });

    return () => {
      triggers.forEach((t) => {
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
    };
  }, [
    scrollContainerRef,
    enableBlur,
    baseOpacity,
    blurStrength,
    trigger,
    start,
    end,
  ]);

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <div className={`scroll-reveal-text ${textClassName}`}>{splitText}</div>
    </div>
  );
};

export default ScrollReveal;
