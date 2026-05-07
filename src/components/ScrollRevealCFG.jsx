import ScrollReveal from "./ScrollReveal";
import JesterLogo from "./Logo";
import { motion as Motion } from "motion/react";
import GradientTextCFG from "./GradientTextCFG";
import { useRef } from "react";

const ScrollRevealCFG = () => {
  const sectionRef = useRef(null);

  return (
    <div className="reveal-container" ref={sectionRef}>
      <div className="reveal-left">
        <ScrollReveal baseOpacity={0.15} enableBlur={true} blurStrength={10}>
          When music begins to play, a mix of physical and emotional reactions
          comes to life. From simple air vibrations to how our brain interprets
          them, every sound can spark feelings like joy or nostalgia. Every song
          holds a small journey within it. Each chord and texture creates a bond
          between the composer and the listener. Music can transport us to
          different places, moments and sensations if we let ourselves follow
          its flow.
        </ScrollReveal>

        <ScrollReveal
          baseOpacity={0.15}
          enableBlur={true}
          blurStrength={12}
          textClassName="highlight"
        >
          <GradientTextCFG />
        </ScrollReveal>
      </div>

      <div className="reveal-right">
        <div className="container">
          <ScrollReveal
            baseOpacity={0.15}
            enableBlur={true}
            blurStrength={15}
            trigger=".reveal-container"
            start="top 90%" // Reveal at the very start of the section
            end="bottom 10%" // Hide at the very end of the section
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
  );
};

export default ScrollRevealCFG;
