import { useState } from "react";
import Icon from "./Icon";
import CongregationCard from "./CongregationCard";
import { CONGREGATIONS, SCHEDULES, REGIONS } from "../data";

const DEFAULT_MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2376.665339197989!2d-115.38085319502014!3d32.603189079734186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d776aa18d4582b%3A0x9d49d2ae9c7c3c3f!2sCentro%20Familiar%20Cristiano%20Bethel!5e0!3m2!1ses-419!2smx!4v1777755895194!5m2!1ses-419!2smx";

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);

const MapEmbed = ({ src }) => (
  <div className="relative min-h-72 overflow-hidden bg-slate-100 sm:min-h-80 lg:min-h-107.5">
    <iframe
      src={src}
      width="100%"
      height="100%"
      className="absolute inset-0 h-full w-full border-0"
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
  const [query, setQuery] = useState("");
  const [mapUrl, setMapUrl] = useState(DEFAULT_MAP_URL);

  const handleSearch = (event) => {
    event.preventDefault();
    const location = query.trim();

    if (!location) return;

    const search = `Centro Familiar Cristiano Bethel cerca de ${location}`;
    setMapUrl(`https://www.google.com/maps?q=${encodeURIComponent(search)}&output=embed`);
  };

  return (
    <section className="bg-[#fbfbff] py-16 sm:py-20 lg:py-24" id="congregations">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-brand-DEFAULT shadow-[0_18px_50px_rgba(13,59,122,0.08)] lg:grid-cols-[1fr_1.08fr]">
          <div className="flex min-h-90 items-center px-7 py-12 sm:px-12 lg:min-h-107.5 lg:px-16">
            <div className="flex w-full max-w-lg flex-col items-start">
              <h2 className="max-w-md text-[30px] font-bold leading-[1.12] tracking-tight text-white sm:text-[32px]">
                Encuentra la congregación cerca de ti
              </h2>
              <h3 className="mt-5 text-xl font-semibold leading-tight tracking-tight text-slate-300 sm:text-2xl">
                ¿Necesitas más información?
              </h3>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                Estamos aquí para ayudarte y responder cualquier pregunta que tengas.
              </p>

              <a
                href="#contact"
                className="mt-7 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-slate-900 shadow-md transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b9b]"
                style={{ background: "#FCD34D" }}
              >
                Contáctanos <Icon name="arrow-right" size={16} />
              </a>
            </div>
          </div>

          <MapEmbed src={mapUrl} />
        </div>

        {/* <CTABanner /> */}

        {/* Components preserved for future use: CongregationCard, filters and ScheduleTable. */}
      </div>
    </section>
  );
};

export default Congregations;
