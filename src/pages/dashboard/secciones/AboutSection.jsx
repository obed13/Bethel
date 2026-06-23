import React from 'react'
import ImgUpload from '../components/ImgUpload';
import Field from '../components/Field';
import Card from '../components/Card';
import DelBtn from '../components/DelBtn';
import AddBtn from '../components/AddBtn';

const AboutSection = ({ data, onChange }) => {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  const addValue = () => onChange({ ...data, values: [...data.values, { icon: "ti-heart", title: "Nuevo valor", desc: "Descripción" }] });
  const delValue = (i) => onChange({ ...data, values: data.values.filter((_, idx) => idx !== i) });
  const setVal   = (i, key, val) => {
    const v = [...data.values];
    v[i] = { ...v[i], [key]: val };
    onChange({ ...data, values: v });
  };
  return (
    <div className="flex flex-col gap-4">
      <ImgUpload label="Foto de comunidad" hint="JPG/PNG · Recomendado 800×500px" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Etiqueta de sección" value={data.sectionTag}  onChange={s("sectionTag")} placeholder="Nuestra Identidad" />
        <Field label="Título"              value={data.title}        onChange={s("title")} />
        <Field label="Años de ministerio"  value={data.years}        onChange={s("years")} placeholder="22+" />
        <Field label="Etiqueta del contador" value={data.yearsLabel} onChange={s("yearsLabel")} placeholder="Años de Ministerio" />
      </div>
      <Field label="Descripción principal" value={data.description}  onChange={s("description")} type="textarea" />
      <Field label="Párrafo adicional"     value={data.description2} onChange={s("description2")} type="textarea" />
      <Card title="Valores destacados" action={<AddBtn onClick={addValue} />}>
        {(data.values || []).length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Sin valores. Añade uno.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.values.map((v, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Icono (Tabler)" value={v.icon}  onChange={(val) => setVal(i, "icon",  val)} placeholder="ti-users-group" />
                  <Field label="Título"         value={v.title} onChange={(val) => setVal(i, "title", val)} />
                  <Field label="Descripción"    value={v.desc}  onChange={(val) => setVal(i, "desc",  val)} />
                </div>
                <DelBtn onClick={() => delValue(i)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default AboutSection