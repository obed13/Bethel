import { useState } from "react";
import Icon from "./Icon";
import CongregationCard from "./CongregationCard";
import { CONGREGATIONS, SCHEDULES, REGIONS } from "../data";

const MapEmbed = () => (
  <div
    className="w-full bg-slate-100 rounded-3xl overflow-hidden shadow-sm border border-slate-200 mb-20"
    style={{ height: 400 }}
  >
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2376.665339197989!2d-115.38085319502014!3d32.603189079734186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d776aa18d4582b%3A0x9d49d2ae9c7c3c3f!2sCentro%20Familiar%20Cristiano%20Bethel!5e0!3m2!1ses-419!2smx!4v1777755895194!5m2!1ses-419!2smx"
      width="100%"
      height="100%"
      style={{ border: 0, filter: "grayscale(1) contrast(1.1)" }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Centro Familiar Cristiano Bethel"
    />
  </div>
);

const ScheduleTable = () => (
  <div className="mt-24 max-w-4xl mx-auto">
    <h3 className="text-2xl font-semibold text-slate-900 text-center mb-8 tracking-tight">
      Horarios de Cultos
    </h3>
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
      {SCHEDULES.map((s) => (
        <div
          key={s.city}
          className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <span className="font-semibold text-slate-800">{s.city}</span>
          <span className="text-sm text-slate-500">{s.times}</span>
        </div>
      ))}
    </div>
  </div>
);

const CTABanner = () => (
  <div className="mt-24 max-w-5xl mx-auto">
    <div className="bg-slate-50 rounded-3xl p-10 md:p-14 text-center border border-slate-100">
      <h3 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">
        ¿Necesitas más información?
      </h3>
      <p className="text-slate-500 max-w-xl mx-auto mb-8 font-light leading-relaxed">
        Estamos aquí para ayudarte a encontrar la congregación más cercana y responder
        cualquier pregunta que tengas.
      </p>
      <a
        href="#contact"
        className="inline-flex items-center gap-2 px-8 py-3 text-slate-900 text-sm font-semibold rounded-full hover:opacity-90 transition-colors shadow-md"
        style={{ background: "#FCD34D" }}
      >
        Contáctanos <Icon name="arrow-right" size={16} />
      </a>
    </div>
  </div>
);

const Congregations = () => {
  //const [filter, setFilter] = useState("Todas");
  /*const filtered =
    filter === "Todas"
      ? CONGREGATIONS
      : CONGREGATIONS.filter((c) => c.region === filter);*/

  return (
    <section className="bg-white pt-20 pb-20" id="congregations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-4">
            Encuentra la congregación cerca de ti
          </h2>
          <div
            className="h-1 w-16 mx-auto rounded-full"
            style={{ background: "#FCD34D" }}
          />
        </div>

        <MapEmbed />

        {/*<div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-slate-950 tracking-tight">
            Nuestras Congregaciones
          </h2>
        </div>*/}

        {/* Region filter */}
        {/*<div className="flex flex-wrap justify-center gap-3 mb-12">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                filter === r
                  ? "bg-brand-DEFAULT text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-brand-DEFAULT hover:text-slate-950"
              }`}
            >
              {r}
            </button>
          ))}
        </div>*/}

        {/* Cards grid */}
        {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((c) => (
            <CongregationCard key={c.name} c={c} />
          ))}
        </div>

        {/*<ScheduleTable />*/}
        <CTABanner />
      </div>
    </section>
  );
};

export default Congregations;
