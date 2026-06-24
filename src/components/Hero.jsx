import Icon from "./Icon";
import { useLandingSection } from "../hooks/useLanding";

const Hero = () => {
  const { data, loading } = useLandingSection("hero");

  // Mientras carga muestra el fondo oscuro sin texto (evita layout shift)
  if (loading) {
    return (
      <section
        className="relative flex items-center justify-center overflow-hidden bg-slate-950"
        style={{ minHeight: "85vh" }}
      />
    );
  }
 
  const {
    badge,
    title,
    subtitle,
    verse,
    verseRef,
    ctaPrimary,
    ctaSecondary,
    bgImage,
    showBadge,
    showVerse,
  } = data;
 
  return (
  <section
    className="relative flex items-center justify-center overflow-hidden"
    style={{ minHeight: "85vh" }}
  >
    {/* Background */}
    <div className="absolute inset-0 z-0">
      <img
        src={
            bgImage ||
            "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80"
          }
        alt="Congregación"
        className="w-full h-full object-cover"
        style={{ filter: "grayscale(1)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(15,23,42,0.9), rgba(30,41,59,0.8), rgba(2,6,23,0.8))",
        }}
      />
      <div className="absolute inset-0 bg-black/30" />
    </div>

    {/* Content */}
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
      {/* Badge */}
      {showBadge && badge && (
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
        <span className="text-xs font-medium sm:text-[10px] md:text-xs tracking-wide uppercase">
          {badge}
        </span>
      </div>
      )}

      {/* Título */}
      <h1 className="text-4xl sm:text-5xl xs:text-lg sd:text-xl ms:text-xl md:text-6xl font-semibold tracking-tight leading-tight">
        {title}  <br className="hidden md:block" />
        <span className="text-slate-300">{subtitle}</span>
      </h1>

      {/* Versículo */}
      {showVerse && verse && (
        <p className="text-lg sm:text-xl text-slate-200 font-light italic max-w-2xl mx-auto border-l-2 border-slate-400 pl-4 py-1">
          {verse}
          {verseRef && (
                <>
                  <br />
                  <span className="text-sm not-italic font-medium text-white block mt-1">
                    — {verseRef}
                  </span>
                </>
              )}
        </p>
      )}
      
      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        {ctaPrimary && (
          <a
            href="#welcome"
            className="sm:w-auto hover:bg-slate-100 transition flex items-center justify-center gap-2 font-medium text-slate-950 bg-white w-full rounded-lg px-8 py-3.5 shadow-lg"
          >
            {ctaPrimary}  <Icon name="arrow-right" size={16} />
          </a>
        )}
        {ctaSecondary && (
          <a
            href="#contact"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-white text-white font-medium hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            {ctaSecondary}
          </a>
        )}
      </div>
    </div>
  </section>
  );
};

export default Hero;
