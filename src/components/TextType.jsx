"use client";

import {
  useEffect,
  useRef,
  useState,
  createElement,
  useMemo,
  useCallback,
} from "react";
import { gsap } from "gsap";
import "./TextType.css";
import soundManager from "../utils/SoundManager";

const TextType = ({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 500,
  className = "",
  showCursor = true,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onComplete,
  startOnVisible = true,
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const cursorRef = useRef(null);
  const containerRef = useRef(null);

  const textArray = useMemo(
    () => (Array.isArray(text) ? text : [text]),
    [text],
  );
  
  // For this version, we'll focus on the first string or join the array
  const fullText = useMemo(() => textArray.join(" "), [textArray]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return "inherit";
    // If we have colors for parts, we could map them, 
    // but for simple text sticking to first color or inherit
    return textColors[0] || "inherit";
  };

  // Visibility Observer
  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  // Cursor Animation
  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, [showCursor, cursorBlinkDuration]);

  // Typing logic
  useEffect(() => {
    if (!isVisible || isCompleted) return;

    let timeout;

    const typeNextChar = () => {
      if (currentCharIndex < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + fullText[currentCharIndex]);
          setCurrentCharIndex((prev) => prev + 1);
        }, variableSpeed ? getRandomSpeed() : typingSpeed);
      } else {
        // Typing finished
        setIsCompleted(true);
        if (onComplete) onComplete();
      }
    };

    if (currentCharIndex === 0 && displayedText === "") {
      timeout = setTimeout(typeNextChar, initialDelay);
    } else {
      typeNextChar();
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    fullText,
    isVisible,
    isCompleted,
    typingSpeed,
    variableSpeed,
    getRandomSpeed,
    initialDelay,
    onComplete
  ]);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `text-type ${className}`,
      ...props,
    },
    <div className="text-type__content-wrapper">
      <span
        className="text-type__content"
        style={{ color: getCurrentTextColor() }}
      >
        {displayedText}
      </span>
      {showCursor && !isCompleted && (
        <span
          ref={cursorRef}
          className={`text-type__cursor ${cursorClassName}`}
        >
          {cursorCharacter}
        </span>
      )}
    </div>,
    isCompleted && (
      <div className="text-type__arrow">
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    )
  );
};

export default TextType;
