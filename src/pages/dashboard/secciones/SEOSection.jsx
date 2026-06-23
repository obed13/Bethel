import React from 'react'
import Field from '../components/Field';
import Card from '../components/Card';
import ImgUpload from '../components/ImgUpload';

const SEOSection = ({ data, onChange }) => {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Título de la página (title tag)" value={data.title}       onChange={s("title")}       placeholder="CFC Bethel | Iglesia Cristiana..." />
      <Field label="Descripción (meta description)"  value={data.description} onChange={s("description")} type="textarea"
        hint="Máximo 160 caracteres. Aparece en los resultados de Google." />
      <Field label="Palabras clave (keywords)"       value={data.keywords}    onChange={s("keywords")}    placeholder="iglesia, cristiana, españa..." />

      <Card title="Vista previa en Google">
        <div className="py-2">
          <p className="text-[13px] text-blue-700 mb-0.5 break-all">{data.title || "Título de la página"}</p>
          <p className="text-[11px] text-green-700 mb-1">{data.pageUrl || "bethel-pages.dev"}</p>
          <p className="text-[12px] text-slate-500 leading-relaxed">{data.description || "Descripción de la página…"}</p>
        </div>
      </Card>

      <ImgUpload label="Imagen para compartir (OG Image)" hint="JPG/PNG · 1200×630px recomendado. Aparece al compartir en redes sociales." />
      <ImgUpload label="Favicon" hint="ICO o PNG · 32×32px" />
    </div>
  );
}

export default SEOSection