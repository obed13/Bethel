import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// ─── Iconos inline ────────────────────────────────────────────────────────────

const IcoMail = () => (
  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IcoLock = () => (
  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IcoEye = ({ open }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </>
    )}
  </svg>
);

const IcoArrow = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Social icons ─────────────────────────────────────────────────────────────

const IcoGoogle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const IcoFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const LoginPage = () => {
  const { login, error: authError, loading } = useAuth();
  const navigate = useNavigate();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [remember,   setRemember]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("holoa")
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    setLoading(true);
    if (success) navigate("/dashboard");
    // Aquí conectas tu lógica de autenticación
    // await signIn(email, password)
    setTimeout(() => setLoading(false), 1500); // simulación
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-105 flex flex-col gap-6">

        {/* ── Logo ── */}
        <div className="text-center">
          <a href="/" className="inline-block text-2xl font-semibold text-slate-950 tracking-tighter mb-1">
            CFCBethel<span className="text-slate-400">.</span>
          </a>
          <p className="text-sm text-slate-400 font-light">Bienvenidos a Casa</p>
        </div>

        {/* ── Tarjeta ── */}
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm flex flex-col gap-5">

          {/* Encabezado tarjeta */}
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight mb-1">
              Iniciar sesión
            </h1>
            <p className="text-sm text-slate-400 font-light">
              Accede a tu área personal de CFCBethel
            </p>
          </div>

          {/* Error global */}
          {authError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {authError}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IcoMail />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400
                    outline-none focus:border-slate-950 focus:bg-white transition-colors duration-150"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Contraseña
                </label>
                <a href="/recuperar-contrasena" className="text-[12px] text-slate-400 hover:text-slate-900 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IcoLock />
                </span>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400
                    outline-none focus:border-slate-950 focus:bg-white transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <IcoEye open={showPass} />
                </button>
              </div>
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-3.5 bg-brand-DEFAULT text-white text-sm font-semibold rounded-xl
                hover:bg-slate-800 transition-colors duration-200 cursor-pointer
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                  </svg>
                  Entrando…
                </>
              ) : (
                <>Entrar <IcoArrow /></>
              )}
            </button>
          </form>
        </div>

        {/* ── Versículo ── */}
        <div className="bg-brand-DEFAULT rounded-2xl px-5 py-4 flex items-start gap-3">
          <div className="w-0.5 bg-[#FCD34D] rounded-full self-stretch shrink-0" />
          <div>
            <p className="text-xs text-slate-300 font-light italic leading-relaxed">
              "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito."
            </p>
            <p className="text-[11px] text-slate-200 font-medium mt-1.5">— Juan 3:16</p>
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[11px] text-slate-400">
          © 2026 CFCBethel ·{" "}
          <a href="/privacidad" className="hover:text-slate-600 transition-colors">Privacidad</a>
          {" · "}
          <a href="/aviso-legal" className="hover:text-slate-600 transition-colors">Aviso legal</a>
        </p>

      </div>
    </div>
  );
};
