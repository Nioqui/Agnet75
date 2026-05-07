import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hex color interpolation utility.
 * Takes two hex colors and a progress value (0–1),
 * returns the interpolated hex color.
 */
function lerpColor(colorA, colorB, t) {
  const clamped = Math.min(1, Math.max(0, t));

  const aR = parseInt(colorA.slice(1, 3), 16);
  const aG = parseInt(colorA.slice(3, 5), 16);
  const aB = parseInt(colorA.slice(5, 7), 16);

  const bR = parseInt(colorB.slice(1, 3), 16);
  const bG = parseInt(colorB.slice(3, 5), 16);
  const bB = parseInt(colorB.slice(5, 7), 16);

  const r = Math.round(aR + (bR - aR) * clamped);
  const g = Math.round(aG + (bG - aG) * clamped);
  const b = Math.round(aB + (bB - aB) * clamped);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * useScrollColor — Smoothly interpolates the background color of a
 * target element between two hex values based on scroll progress.
 *
 * @param {Object}  options
 * @param {string}  options.startColor   - Starting hex color (default "#000000")
 * @param {string}  options.endColor     - Ending hex color   (default "#1a0b2e")
 * @param {string}  options.trigger      - CSS selector or element for the scroll trigger start
 * @param {string}  options.endTrigger   - CSS selector or element for the scroll trigger end (optional)
 * @param {string}  options.start        - ScrollTrigger start position (default "top top")
 * @param {string}  options.end          - ScrollTrigger end position   (default "bottom top")
 * @param {React.RefObject} options.targetRef - Ref to the element whose background changes
 *
 * @returns {React.RefObject} targetRef (same ref passed in, for convenience)
 */
export default function useScrollColor({
  startColor = "#000000",
  endColor = "#1a0b2e",
  trigger,
  endTrigger,
  start = "top top",
  end = "bottom top",
  targetRef,
} = {}) {
  const internalRef = useRef(null);
  const ref = targetRef || internalRef;

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    // Set initial color
    el.style.backgroundColor = startColor;

    const st = ScrollTrigger.create({
      trigger: trigger || el,
      endTrigger: endTrigger || undefined,
      start,
      end,
      scrub: 0, // instant response, no smoothing lag
      onUpdate: (self) => {
        el.style.backgroundColor = lerpColor(
          startColor,
          endColor,
          self.progress,
        );
      },
    });

    return () => {
      st.kill();
    };
  }, [startColor, endColor, trigger, endTrigger, start, end, ref]);

  return ref;
}

// Export the utility too, in case it's useful elsewhere
export { lerpColor };
