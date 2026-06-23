import React from 'react'
import Field from '../components/Field';
import Card from '../components/Card';
import AddBtn from '../components/AddBtn';
import DelBtn from '../components/DelBtn';

const CongregSection = ({ data, onChange }) => {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  const add = () => onChange({ ...data, items: [...data.items, { city: "Nueva ciudad", pastor: "", address: "", phone: "", schedule: "" }] });
  const del = (i) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  const set = (i, key, val) => {
    const arr = [...data.items];
    arr[i] = { ...arr[i], [key]: val };
    onChange({ ...data, items: arr });
  };
  return (
    <div className="flex flex-col gap-4">
      <Field label="URL del mapa (iframe embed)" value={data.mapEmbed} onChange={s("mapEmbed")}
        placeholder="https://www.google.com/maps/embed?pb=..." hint="Copia el src del iframe que genera Google Maps → Compartir → Insertar un mapa" />
      <Card title="Sedes" action={<AddBtn onClick={add} label="Añadir sede" />}>
        {(data.values || []).length === 0 ?  (
          <p className="text-sm text-slate-400 text-center py-4">Sin sedes. Añade una.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.items.map((c, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Field label="Ciudad"    value={c.city}     onChange={(v) => set(i, "city",     v)} />
                  <Field label="Pastores"  value={c.pastor}   onChange={(v) => set(i, "pastor",   v)} />
                  <Field label="Dirección" value={c.address}  onChange={(v) => set(i, "address",  v)} />
                  <Field label="Teléfono"  value={c.phone}    onChange={(v) => set(i, "phone",    v)} />
                  <Field label="Horario"   value={c.schedule} onChange={(v) => set(i, "schedule", v)} />
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

export default CongregSection