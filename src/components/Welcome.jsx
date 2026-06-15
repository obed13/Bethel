import Icon from "./Icon";

const Welcome = () => (
  <section className="lg:py-28 bg-white pt-20 pb-20" id="welcome">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Image */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-slate-200 rounded-full blur-2xl" />
          <img
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Comunidad MSBN"
            className="relative rounded-2xl shadow-xl z-10 w-full object-cover"
            style={{ height: 500, filter: "grayscale(0.2)" }}
          />
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg z-20 max-w-50 border border-slate-100 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-950 flex items-center justify-center">
                <Icon name="heart" size={24} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 leading-none">17+</p>
                <p className="text-xs text-slate-500 mt-1">Años de Ministerio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-6">
          <span className="text-slate-950 font-medium tracking-wide text-sm uppercase">
            Nuestra Identidad
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            Una familia de fe comprometida con la{" "}
            <span
              style={{
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundImage: "linear-gradient(to right,#0f172a,#334155)",
              }}
            >
              Gran Comisión
            </span>
          </h2>
          <p className="text-slate-600 leading-relaxed font-light">
            En CFC Bethel, llevamos más de una década sirviendo a nuestra comunidad y
            expandiendo el mensaje de esperanza en la nación. Creemos en una iglesia activa,
            acogedora y relevante para los tiempos actuales.
          </p>
          <p className="text-slate-600 leading-relaxed font-light">
            Nuestra visión es formar discípulos que impacten su entorno, viviendo los principios
            del Reino de Dios con autenticidad y amor.
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

export default Welcome;
