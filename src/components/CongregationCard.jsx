import Icon from "./Icon";

const CongregationCard = ({ c }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
    <div className="relative h-48 overflow-hidden rounded-t-3xl">
      <img
        src={c.img}
        alt={c.name}
        className="group-hover:scale-105 transition-transform duration-500 w-full h-full object-cover"
        style={{ filter: "grayscale(0.2)" }}
      />
    </div>

    <div className="p-6 flex-1 flex flex-col space-y-4">
      <h3 className="text-xl font-semibold text-slate-900 text-center">{c.name}</h3>

      <div className="space-y-3 flex-1">
        <div className="flex items-start gap-3 text-sm">
          <Icon name="user" size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-700">Pastores: </span>
            <span className="text-slate-500">{c.pastors}</span>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Icon name="map-pin" size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="text-slate-500">{c.address}</span>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Icon name="phone" size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="text-slate-500">{c.phone}</span>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Icon name="clock" size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <div className="text-slate-500">
            {c.schedule.map((s) => (
              <p key={s}>{s}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 text-center">
        <a
          href="#"
          className="inline-block px-6 py-2 text-slate-900 text-sm font-semibold rounded-full hover:opacity-90 transition-colors shadow-sm"
          style={{ background: "#FCD34D" }}
        >
          Más información
        </a>
      </div>
    </div>
  </div>
);

export default CongregationCard;
