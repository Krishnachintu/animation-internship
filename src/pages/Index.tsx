import HeroSection from "@/components/HeroSection";

const Index = () => {
  return (
    <main>
      {/* Cinematic scroll hero */}
      <HeroSection />

      {/* Post-scroll content — gives body height so ScrollTrigger has room */}
      <section className="relative z-10 flex items-center justify-center min-h-screen hero-gradient">
        <div className="text-center px-6 space-y-4">
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground">
            The journey continues
          </p>
          <div
            className="accent-line w-32 mx-auto"
            style={{ opacity: 0.6 }}
          />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
            Beyond the Horizon
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Where performance meets artistry. Every detail, every curve,
            engineered to perfection.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Index;
