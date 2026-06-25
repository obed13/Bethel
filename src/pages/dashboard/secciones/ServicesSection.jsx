import {useRef} from 'react'
import Field from '../components/Field';
import Card from '../components/Card';
import DelBtn from '../components/DelBtn';
import AddBtn from '../components/AddBtn';

const ServicesSection = ({ data, onChange }) => {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  const listRef = useRef(null);

  
  const add = () => {
    const newItems = [...data.items, { title: "Nuevo servicio", time: "Día HH:MMh", desc: "Descripción del servicio.", featured: false }];
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
      <Card title="Servicios" action={<AddBtn onClick={add} />}>
        {(data.items || []).length === 0 ?  (
          <p className="text-sm text-slate-400 text-center py-4">Sin servicios. Añade uno.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {(data.items || []).map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Título"       value={item.title} onChange={(v) => set(i, "title", v)} />
                  <Field label="Horario"      value={item.time}  onChange={(v) => set(i, "time",  v)} />
                  <Field label="Descripción"  value={item.desc}  onChange={(v) => set(i, "desc",  v)} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Tipo</label>
                    <select
                      value={item.featured ? "true" : "false"}
                      onChange={(e) => set(i, "featured", e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 transition-colors"
                    >
                      <option value="false">Normal</option>
                      <option value="true">Destacado</option>
                    </select>
                  </div>
                </div>
                <DelBtn onClick={() => del(i)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default ServicesSection