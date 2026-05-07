import Particles from "./Particles";

function Background() {
  return (
    <div
      className="hero-background-mask"
      style={{
        width: "100%",
        height: "110vh",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
        /* Refined Symmetric Mask: Fading edges and curved corners */
        maskImage: `
          radial-gradient(ellipse 35% 15% at 0% 0%, transparent 0%, black 100%),
          radial-gradient(ellipse 35% 15% at 100% 0%, transparent 0%, black 100%),
          radial-gradient(ellipse 35% 15% at 0% 100%, transparent 0%, black 100%),
          radial-gradient(ellipse 35% 15% at 100% 100%, transparent 0%, black 100%),
          linear-gradient(to bottom, transparent 0%, black 15%, black 70%, transparent 100%)
        `,
        maskComposite: "intersect",
        WebkitMaskImage: `
          radial-gradient(ellipse 35% 15% at 0% 0%, transparent 0%, black 100%),
          radial-gradient(ellipse 35% 15% at 100% 0%, transparent 0%, black 100%),
          radial-gradient(ellipse 35% 15% at 0% 100%, transparent 0%, black 100%),
          radial-gradient(ellipse 35% 15% at 100% 100%, transparent 0%, black 100%),
          linear-gradient(to bottom, transparent 0%, black 15%, black 70%, transparent 100%)
        `,
        WebkitMaskComposite: "source-in",
      }}
    >
      <Particles
        particleColors={["#ffffff", "#ffffff"]}
        particleCount={400}
        particleSpread={10}
        speed={0.2}
        particleBaseSize={100}
        moveParticlesOnHover={false}
        alphaParticles={false}
        disableRotation={true}
      />
    </div>
  );
}

export default Background;
