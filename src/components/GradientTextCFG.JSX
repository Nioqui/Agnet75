import GradientText from "./GradientText";

function GradientTextCFG() {
  return (
    <GradientText
      colors={["#5227FF", "#00ff40"]}
      animationSpeed={20}
      showBorder={false}
      className="custom-class"
    >
      This is the Agnet Experience.
    </GradientText>
  );
}

export default GradientTextCFG;
