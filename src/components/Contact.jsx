import Icon from "./Icon";
import { SOCIALS } from "../data";
import useContactForm from "../hooks/useContactForm";
import { useLandingSection } from "../hooks/useLanding";

const InputField = ({ label, name, type = "text", placeholder, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-slate-700 mb-1 uppercase tracking-wide">
      {label}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-DEFAULT disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      placeholder={placeholder}
    />
  </div>
);

const SocialLinks = ({ phone, address, waNumber, showWA }) => (
  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
    <h3 className="text-xl font-medium text-slate-900 mb-6">
      Conéctate con nuestras plataformas
    </h3>
    <div className="space-y-6">
      {SOCIALS.map((s) => (
        <a key={s.label} href={s.href} target="_black" className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-sm group-hover:bg-brand-DEFAULT group-hover:text-white transition-colors">
            <Icon name={s.icon} size={20} />
          </div>
          <div>
            <p className="font-medium text-slate-900">{s.label}</p>
            <p className="text-xs text-slate-500">{s.handle}</p>
          </div>
        </a>
      ))}
    </div>

    <div className="mt-8 pt-8 border-t border-slate-200 space-y-3">
      <div className="flex items-start gap-3 text-sm text-slate-600">
        <Icon name="map-pin" size={16} className="text-slate-950 mt-0.5" />
        <span>{address}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Icon name="phone" size={16} className="text-slate-950" />
        <span>{phone}</span>
      </div>
      {showWA && waNumber && (
        <div className="flex items-center gap-3 text-sm text-slate-600">
        <Icon name="phone" size={16} className="text-slate-950" />
        <span>
          <a 
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors"
          >
            WhatsApp
          </a>
        </span>
      </div>
        
      )}
    </div>
  </div>
);

const Contact = () => {
  const { form,
  status,
  errorMsg,
  handleChange,
  handleSubmit,
  isLoading,
  isSuccess,
  isError, } = useContactForm();
  const { data } = useLandingSection("contact");
  const { phone, address, waNumber, showWA } = data;

  return (
    <section id="contact" className="py-20 bg-white border-t border-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Form */}
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              Contáctanos
            </h2>
            <p className="text-slate-500 mb-8 font-light">
              Estamos aquí para servirte. Envíanos un mensaje o petición de oración.
            </p>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Nombre"
                  name="name"
                  placeholder="Tu nombre completo"
                  value={form.name}
                  onChange={handleChange}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <InputField
                label="Asunto"
                name="subject"
                placeholder="Motivo de contacto"
                value={form.subject}
                onChange={handleChange}
              />

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 uppercase tracking-wide">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-DEFAULT"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>
              {isError && (
  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
    {errorMsg}
  </div>
)}

{isSuccess && (
  <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
    Mensaje enviado correctamente. Gracias por contactarnos.
  </div>
)}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-brand-DEFAULT text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>{isLoading ? "Enviando..." : "Enviar Mensaje"}</span>
                <Icon name="send" size={16} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col justify-center lg:pl-12">
            <SocialLinks phone={phone} address={address} waNumber={waNumber} showWA={showWA} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
