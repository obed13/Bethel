import React from 'react'
import ImgUpload from '../components/ImgUpload';
import Field from '../components/Field';
import Card from '../components/Card';
import Toggle from '../components/Toggle';

const HeroSection = ({ data, onChange }) => {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="flex flex-col gap-4">
      <ImgUpload label="Imagen de fondo" hint="JPG/PNG · Recomendado 1920×1080px" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Badge superior"   value={data.badge}       onChange={s("badge")}       placeholder="Bienvenidos a casa" />
        <Field label="Título principal" value={data.title}       onChange={s("title")}       placeholder="SOMOS UNA IGLESIA..." />
        <Field label="Subtítulo"        value={data.subtitle}    onChange={s("subtitle")}    placeholder="22 AÑOS..." />
        <Field label="Botón primario"   value={data.ctaPrimary}  onChange={s("ctaPrimary")}  placeholder="Más Información" />
        <Field label="Botón secundario" value={data.ctaSecondary} onChange={s("ctaSecondary")} placeholder="Contáctanos" />
      </div>
      <Card title="Versículo bíblico">
        <div className="flex flex-col gap-3">
          <Field label="Texto del versículo" value={data.verse}    onChange={s("verse")}    type="textarea" />
          <Field label="Referencia"          value={data.verseRef} onChange={s("verseRef")} placeholder="Marcos 16:15" />
          <Toggle label="Mostrar versículo"  checked={data.showVerse} onChange={s("showVerse")} />
        </div>
      </Card>
      <Toggle label="Mostrar badge de bienvenida" checked={data.showBadge} onChange={s("showBadge")} />
    </div>
  );
}

export default HeroSection