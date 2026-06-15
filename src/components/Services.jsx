import Icon from "./Icon";
import { SERVICES } from "../data";

const ServiceCard = ({ s }) => (
  <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-950 flex items-center justify-center mb-6 group-hover:bg-brand-DEFAULT group-hover:text-white transition-colors">
      <Icon name={s.icon} size={24} />
    </div>
    <h3 className="text-xl font-medium text-slate-900 mb-2">{s.title}</h3>
    <p className="text-sm text-slate-950 font-medium mb-3 flex items-center gap-1">
      <Icon name="clock" size={14} /> {s.schedule}
    </p>
    <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
  </div>
);

const FeaturedServiceCard = () => (
  <div className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden md:col-span-2 text-white bg-brand-DEFAULT rounded-2xl p-8 relative shadow-lg">
    <div className="absolute top-0 right-0 p-8 opacity-10">
      <Icon name="church" size={120} />
    </div>
    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
      <div className="flex-1">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm"
          style={{ background: "rgba(255,255,255,0.2)" }}
        >
          <Icon name="sun" size={24} />
        </div>
        <h3 className="text-2xl font-semibold mb-2 tracking-tight">Servicio General</h3>
        <p className="flex items-center gap-2 font-medium text-slate-300 mb-4">
          <Icon name="clock" size={16} /> Domingo 10:30 a.m.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed max-w-md">
          Nuestra reunión central. Un tiempo glorioso de alabanza, adoración y exposición de
          la Palabra de Dios para toda la familia.
        </p>
      </div>
    </div>
  </div>
);

const Services = () => (
  <section id="services" className="py-20 bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-4">
          Nuestros Servicios
        </h2>
        <p className="text-slate-500 font-light">
          Espacios diseñados para tu crecimiento espiritual y conexión comunitaria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((s) => (
          <ServiceCard key={s.title} s={s} />
        ))}
        <FeaturedServiceCard />
      </div>
    </div>
  </section>
);

export default Services;
