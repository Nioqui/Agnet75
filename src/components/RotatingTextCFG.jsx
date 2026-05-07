import RotatingText from "./RotatingText.jsx";

function RotatingTextCFG() {
  return (
    <>
      <RotatingText
        texts={["composition", "production", "mixing", "mastering"]}
        mainClassName="px-8 py-3 bg-[#159b42] text-black overflow-hidden rounded-[5px]"
        staggerFrom={"last"}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-120%" }}
        staggerDuration={0.025}
        splitLevelClassName="overflow-hidden pb-1 sm:pb-1 md:pb-1"
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        rotationInterval={2000}
      />
    </>
  );
}

export default RotatingTextCFG;
