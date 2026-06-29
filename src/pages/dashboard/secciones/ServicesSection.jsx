import {useRef} from 'react'
import Field from '../components/Field';
import Card from '../components/Card';
import DelBtn from '../components/DelBtn';
import AddBtn from '../components/AddBtn';
import CollapsibleItem from '../components/CollapsibleItem';

const ServicesSection = ({ data, onChange }) => {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  const listRef = useRef(null);

  
  const add = () => {
    const newItems = [...data.items, { icon: "ti-calendar",title: "Nuevo servicio", time: "Día HH:MMh", desc: "Descripción del servicio.", featured: false }];
    onChange({ ...data, items: newItems });
    setTimeout(() => {
      listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const del = (i) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });

  const set = (i, key, val) => {
    const arr = [...data.items];
    arr[i] = { ...arr[i], [key]: key === "featured" ? val === "true" : val };
    onChange({ ...data, items: arr });
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Título de sección" value={data.sectionTitle} onChange={s("sectionTitle")} />
        <Field label="Subtítulo"         value={data.sectionSub}   onChange={s("sectionSub")} />
      </div>
      <Card title={`Servicios (${data.items.length})`} action={<AddBtn onClick={add} />}>
        {(data.items || []).length === 0 ?  (
          <div className="text-center py-6">
            <i className="ti ti-calendar text-[28px] text-slate-200 block mb-2" aria-hidden="true" />
            <p className="text-sm text-slate-400">Sin servicios. Haz clic en "Añadir".</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2" ref={listRef}>
            {data.items.map((item, i) => (
              <CollapsibleItem
                key={i}
                summary={`${item.title}${item.featured ? " ★" : ""} · ${item.time}`}
                onDelete={() => del(i)}
                deleteLabel="este servicio"
                defaultOpen={i === data.items.length - 1}
              >
                {/* Ícono con preview en vivo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    Ícono Tabler
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Preview del ícono */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      <i
                        className={`ti ${item.icon || "ti-calendar"} text-[20px] text-slate-700`}
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.icon || ""}
                      onChange={(e) => set(i, "icon", e.target.value)}
                      placeholder="ti-diploma-verified"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Busca íconos en{" "}
                    <a
                      href="https://tabler.io/icons"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 underline underline-offset-2 hover:text-slate-900"
                    >
                      tabler.io/icons
                    </a>
                    {" "}· Ejemplo: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">ti-sun</code>
                  </p>
                </div>
 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Título"  value={item.title} onChange={(v) => set(i, "title", v)} />
                  <Field label="Horario" value={item.time}  onChange={(v) => set(i, "time",  v)} />
                </div>
                <Field label="Descripción" value={item.desc} onChange={(v) => set(i, "desc", v)} type="textarea" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Tipo</label>
                  <select value={item.featured ? "true" : "false"} onChange={(e) => set(i, "featured", e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 transition-colors">
                    <option value="false">Normal</option>
                    <option value="true">Destacado (tarjeta oscura)</option>
                  </select>
                </div>
              </CollapsibleItem>
            ))} 
          </div>
        )}
      </Card>
    </div>
  );
}

export default ServicesSection