import Icon from "./Icon";
import { useLandingSection } from "../hooks/useLanding";

const Welcome = () => {
  const { data, loading } = useLandingSection("about");

  // Mientras carga muestra el fondo oscuro sin texto (evita layout shift)
  if (loading) {
    return (
      <section
        className="lg:py-28 bg-white pt-20 pb-20" id="welcome"
      />
    );
  }

  const { sectionTag, title, description, description2, years, yearsLabel, image, values } = data;

  return (
  <section className="lg:py-28 bg-white pt-20 pb-20" id="welcome">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Image */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-slate-200 rounded-full blur-2xl" />
          <img
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Comunidad CFCB"
            className="relative rounded-2xl shadow-xl z-10 w-full object-cover"
            style={{ height: 500, filter: "grayscale(0.2)" }}
          />
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg z-20 max-w-50 border border-slate-100 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-950 flex items-center justify-center">
                <Icon name="heart" size={24} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 leading-none">{years}</p>
                <p className="text-xs text-slate-500 mt-1">{yearsLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-6">
          <span className="text-slate-950 font-medium tracking-wide text-sm uppercase">
            {sectionTag}
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-slate-600 leading-relaxed font-light">
            {description}
          </p>
          <p className="text-slate-600 leading-relaxed font-light">
            {description2}
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Icon name="users" size={24} className="text-slate-950 mt-1" />
              <div>
                <h4 className="text-slate-900 font-medium">Comunidad</h4>
                <p className="text-sm text-slate-500">Unidos en propósito.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="globe" size={24} className="text-slate-950 mt-1" />
              <div>
                <h4 className="text-slate-900 font-medium">Misión</h4>
                <p className="text-sm text-slate-500">Alcance global.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default Welcome;
