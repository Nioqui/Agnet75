import React from "react";
import TextType from "./TextType";

function TextTypeCFG() {
  return (
    <TextType
      text={["every song tells a story"]}
      typingSpeed={75}
      pauseDuration={1500}
      showCursor
      cursorCharacter="▎"
      deletingSpeed={50}
      variableSpeedEnabled={false}
      variableSpeedMin={60}
      variableSpeedMax={120}
      cursorBlinkDuration={0.5}
    />
  );
}

export default TextTypeCFG;
