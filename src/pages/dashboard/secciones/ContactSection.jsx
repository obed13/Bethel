import React from 'react'
import Field from '../components/Field';
import Card from '../components/Card';
import Toggle from '../components/Toggle';

const ContactSection = ({ data, onChange }) => {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Teléfono principal" value={data.phone}   onChange={s("phone")}   placeholder="+52 686 562 2298" />
        <Field label="Dirección"          value={data.address} onChange={s("address")} placeholder="Rio Sta Cruz 3223, Villa Verde" />
      </div>
      <Field label="Número WhatsApp (sin + ni espacios)" value={data.waNumber} onChange={s("waNumber")}
        placeholder="526865622298" hint="Solo dígitos, incluye código de país. Ej: 526865622298" />
      <Card title="Banner CTA">
        <div className="flex flex-col gap-3">
          <Field label="Título"          value={data.ctaTitle} onChange={s("ctaTitle")} />
          <Field label="Subtítulo"       value={data.ctaSub}   onChange={s("ctaSub")} />
          <Field label="Texto del botón" value={data.ctaBtn}   onChange={s("ctaBtn")} placeholder="Contáctanos" />
        </div>
      </Card>
      <Toggle label="Mostrar botón flotante de WhatsApp" checked={data.showWA} onChange={s("showWA")} />
    </div>
  );
}

export default ContactSection