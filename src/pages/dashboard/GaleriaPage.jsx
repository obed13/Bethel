/**
 *
 * Vistas:
 *   1. Grid de álbumes con portada y contador de fotos
 *   2. Detalle del álbum → grid de fotos con lightbox
 *   3. Subida múltiple de fotos via /api/upload → R2
 *   4. Modal crear/editar álbum
 *   5. Modal editar foto (título y descripción)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { authHeaders } from "../../hooks/useAuth";

// ─── Iconos ───────────────────────────────────────────────────────────────────
const IcoPlus    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoEdit    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoTrash   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IcoX       = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoBack    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoNext    = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoPrev    = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoUpload  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoImage   = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IcoZoom    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const IcoPortada = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

// ─── Componentes base ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", placeholder = "", required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea value={value ?? ""} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={2}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-colors resize-none" />
      ) : (
        <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-colors" />
      )}
    </div>
  );
}

function ModalWrapper({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg border border-slate-100 shadow-xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer">
            <IcoX />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

function DelConfirm({ label, onConfirm, onCancel }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-[11px] text-slate-500">¿Eliminar {label}?</span>
      <button onClick={onConfirm}
        className="h-7 px-2.5 rounded-lg bg-red-600 text-white text-[11px] font-medium hover:bg-red-700 cursor-pointer">Sí</button>
      <button onClick={onCancel}
        className="h-7 px-2.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] hover:bg-slate-50 cursor-pointer">No</button>
    </div>
  );
}

// ─── Modal Álbum ──────────────────────────────────────────────────────────────

const EMPTY_ALBUM = { titulo: "", descripcion: "" };

function AlbumModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id;
  const [form,   setForm]   = useState(initial ?? EMPTY_ALBUM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const s = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.titulo.trim()) { setError("El título es obligatorio"); return; }
    setError(""); setSaving(true);
    try {
      const url    = isEdit ? `/api/galeria?id=${initial.id}` : "/api/galeria";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ titulo: form.titulo.trim(), descripcion: form.descripcion }),
      });
      const json = await res.json();
      if (!json.ok) { setError(json.error ?? "Error al guardar"); return; }
      onSaved(json.data);
    } catch { setError("Error de conexión"); }
    finally { setSaving(false); }
  };

  return (
    <ModalWrapper
      title={isEdit ? "Editar álbum" : "Nuevo álbum"}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer disabled:opacity-60">
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear álbum"}
          </button>
        </>
      }
    >
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}
      <Field label="Título del álbum"  value={form.titulo}      onChange={s("titulo")}      placeholder="Cultos y Reuniones" required />
      <Field label="Descripción"       value={form.descripcion} onChange={s("descripcion")} placeholder="Breve descripción del álbum" type="textarea" />
    </ModalWrapper>
  );
}

// ─── Modal editar foto ────────────────────────────────────────────────────────

function FotoEditModal({ foto, onClose, onSaved }) {
  const [form,   setForm]   = useState({ titulo: foto.titulo, descripcion: foto.descripcion });
  const [saving, setSaving] = useState(false);
  const s = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`/api/galeria?fotos=1&id=${foto.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) return;
      onSaved(json.data);
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <ModalWrapper
      title="Editar foto"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer disabled:opacity-60">
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </>
      }
    >
      <img src={foto.url} alt={foto.titulo || "Foto"} className="w-full h-40 object-cover rounded-xl" />
      <Field label="Título"      value={form.titulo}      onChange={s("titulo")}      placeholder="Descripción corta de la foto" />
      <Field label="Descripción" value={form.descripcion} onChange={s("descripcion")} placeholder="Contexto adicional" type="textarea" />
    </ModalWrapper>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ fotos, index, onClose, onNext, onPrev }) {
  const foto = fotos[index];
  if (!foto) return null;

  useEffect(() => {
    const handler = e => {
      if (e.key === "Escape")    onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft")  onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 bg-slate-950/95 z-100 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer transition-colors z-10"
      >
        <IcoX />
      </button>

      {/* Contador */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {index + 1} / {fotos.length}
      </div>

      {/* Navegación anterior */}
      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer transition-colors"
        >
          <IcoPrev />
        </button>
      )}

      {/* Imagen */}
      <div className="max-w-4xl max-h-[80vh] flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
        <img
          src={foto.url}
          alt={foto.titulo || "Foto de Bethel"}
          className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
        />
        {(foto.titulo || foto.descripcion) && (
          <div className="text-center">
            {foto.titulo && <p className="text-white font-medium text-sm">{foto.titulo}</p>}
            {foto.descripcion && <p className="text-white/60 text-xs mt-0.5">{foto.descripcion}</p>}
          </div>
        )}
      </div>

      {/* Navegación siguiente */}
      {index < fotos.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer transition-colors"
        >
          <IcoNext />
        </button>
      )}
    </div>
  );
}

// ─── Zona de subida múltiple ──────────────────────────────────────────────────

function UploadZone({ albumId, onUploaded }) {
  const [files,     setFiles]     = useState([]);  // [{ file, preview, status, url }]
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const items = Array.from(newFiles)
      .filter(f => f.type.startsWith("image/"))
      .map(file => ({
        file,
        preview:  URL.createObjectURL(file),
        status:   "pending",   // "pending" | "uploading" | "done" | "error"
        url:      "",
        key:      "",
        errorMsg: "",
      }));
    setFiles(prev => [...prev, ...items]);
  }, []);

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleInput = e => { addFiles(e.target.files); e.target.value = ""; };

  const removeFile = (i) => {
    setFiles(prev => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, idx) => idx !== i); });
  };

  const handleUpload = async () => {
    const pending = files.filter(f => f.status === "pending");
    if (!pending.length) return;
    setUploading(true);

    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== "pending") continue;
      updated[i] = { ...updated[i], status: "uploading" };
      setFiles([...updated]);

      try {
        const fd = new FormData();
        fd.append("file",   updated[i].file);
        fd.append("folder", "galeria");

        const res  = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: fd });
        const json = await res.json();

        if (!json.ok) {
          updated[i] = { ...updated[i], status: "error", errorMsg: json.error ?? "Error" };
        } else {
          updated[i] = { ...updated[i], status: "done", url: json.url, key: json.key };
        }
      } catch {
        updated[i] = { ...updated[i], status: "error", errorMsg: "Error de conexión" };
      }
      setFiles([...updated]);
    }

    // Registrar las fotos exitosas en D1
    const done = updated.filter(f => f.status === "done");
    if (done.length) {
      const payload = done.map((f, idx) => ({
        album_id:    albumId,
        url:         f.url,
        key:         f.key,
        titulo:      "",
        descripcion: "",
        orden:       idx,
      }));
      const res  = await fetch("/api/galeria?fotos=1", {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) onUploaded(json.data);
    }

    setUploading(false);
    // Limpiar las que están done
    setFiles(prev => prev.filter(f => f.status !== "done"));
  };

  const STATUS_ICON = {
    pending:   <span className="text-slate-400 text-[10px] font-medium">Pendiente</span>,
    uploading: <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />,
    done:      <i className="ti ti-check text-[14px] text-emerald-500" />,
    error:     <i className="ti ti-alert-circle text-[14px] text-red-500" />,
  };

  return (
    <div className="flex flex-col gap-3">

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={[
          "flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
          dragOver ? "border-slate-950 bg-slate-100" : "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white",
        ].join(" ")}
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <span className="text-slate-400"><IcoUpload /></span>
        </div>
        <p className="text-sm font-medium text-slate-700">Arrastra aquí o <span className="text-slate-950 underline underline-offset-2">haz clic</span></p>
        <p className="text-[11px] text-slate-400">JPG, PNG, WebP · Puedes subir varias a la vez</p>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleInput} className="hidden" />
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-slate-100">
                <img src={f.preview} alt="" className="w-full h-full object-cover" />
                {/* Overlay de estado */}
                <div className={[
                  "absolute inset-0 flex items-center justify-center transition-opacity",
                  f.status === "pending" ? "opacity-0 hover:opacity-100 bg-slate-950/40" : "opacity-100 bg-slate-950/40",
                ].join(" ")}>
                  {STATUS_ICON[f.status]}
                </div>
                {f.status === "pending" && (
                  <button onClick={e => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-slate-600 hover:text-red-600 cursor-pointer">
                    <IcoX />
                  </button>
                )}
                {f.status === "error" && (
                  <p className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[9px] text-center py-0.5 truncate px-1">
                    {f.errorMsg}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !files.some(f => f.status === "pending")}
            className="w-full py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Subiendo…</>
            ) : (
              <><IcoUpload /> Subir {files.filter(f => f.status === "pending").length} foto{files.filter(f => f.status === "pending").length !== 1 ? "s" : ""}</>
            )}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Card de álbum ────────────────────────────────────────────────────────────

function AlbumCard({ album, onEdit, onDelete, onClick }) {
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      {/* Portada */}
      <div className="aspect-video bg-slate-100 relative overflow-hidden" onClick={onClick}>
        {album.portada_url ? (
          <img src={album.portada_url} alt={album.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
            <IcoImage />
            <span className="text-[11px]">Sin fotos</span>
          </div>
        )}
        {/* Badge contador */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/70 text-white text-[11px] font-medium backdrop-blur-sm">
          <IcoImage /> {album.total_fotos}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <button onClick={onClick} className="flex-1 min-w-0 text-left">
            <h3 className="font-semibold text-slate-900 text-[14px] leading-tight truncate">{album.titulo}</h3>
            {album.descripcion && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{album.descripcion}</p>}
          </button>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(album)} aria-label="Editar"
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
              <IcoEdit />
            </button>
            <button onClick={() => setConfirmDel(true)} aria-label="Eliminar"
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer transition-colors">
              <IcoTrash />
            </button>
          </div>
        </div>
        {confirmDel && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <DelConfirm
              label="este álbum y todas sus fotos"
              onConfirm={() => { onDelete(album.id); setConfirmDel(false); }}
              onCancel={() => setConfirmDel(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Vista detalle de álbum ───────────────────────────────────────────────────

function AlbumDetail({ album, fotos, loading, onBack, onEditAlbum, onFotosUploaded, onEditFoto, onDeleteFoto, onSetPortada, onOpenLightbox }) {
  const [showUpload, setShowUpload] = useState(false);

  const handleUploaded = useCallback((newFotos) => {
    onFotosUploaded(newFotos);
    setShowUpload(false);
  }, [onFotosUploaded]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors">
            <IcoBack />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{album.titulo}</h1>
            {album.descripcion && <p className="text-sm text-slate-400">{album.descripcion}</p>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => onEditAlbum(album)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
            <IcoEdit /> Editar álbum
          </button>
          <button onClick={() => setShowUpload(v => !v)}
            className={[
              "flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-medium cursor-pointer transition-colors",
              showUpload ? "bg-slate-200 text-slate-700" : "bg-slate-950 text-white hover:bg-slate-800",
            ].join(" ")}>
            <IcoUpload /> {showUpload ? "Cerrar subida" : "Subir fotos"}
          </button>
        </div>
      </div>

      {/* Zona de subida */}
      {showUpload && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-5">
          <p className="text-[13px] font-semibold text-slate-900 mb-3">Subir fotos al álbum</p>
          <UploadZone albumId={album.id} onUploaded={handleUploaded} />
        </div>
      )}

      {/* Grid de fotos */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : fotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <span className="text-slate-300"><IcoImage /></span>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium">Álbum vacío</p>
            <p className="text-slate-300 text-xs mt-0.5">Haz clic en "Subir fotos" para agregar imágenes</p>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 cursor-pointer transition-colors">
            <IcoUpload /> Subir las primeras fotos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {fotos.map((foto, i) => (
            <FotoCard
              key={foto.id}
              foto={foto}
              isPortada={foto.url === album.portada_url}
              onOpenLightbox={() => onOpenLightbox(i)}
              onEdit={() => onEditFoto(foto)}
              onDelete={() => onDeleteFoto(foto.id)}
              onSetPortada={() => onSetPortada(album.id, foto.url)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Card de foto ─────────────────────────────────────────────────────────────

function FotoCard({ foto, isPortada, onOpenLightbox, onEdit, onDelete, onSetPortada }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setConfirmDel(false); }}
    >
      <img
        src={foto.url}
        alt={foto.titulo || "Foto de Bethel"}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
        onClick={onOpenLightbox}
      />

      {/* Badge portada */}
      {isPortada && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCD34D] text-slate-900 text-[10px] font-semibold">
          <IcoPortada /> Portada
        </div>
      )}

      {/* Overlay con acciones */}
      <div className={`absolute inset-0 bg-slate-950/60 transition-opacity ${showActions ? "opacity-100" : "opacity-0"} flex flex-col justify-between p-2`}>
        {/* Título */}
        {foto.titulo && (
          <p className="text-white text-[11px] font-medium truncate">{foto.titulo}</p>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-1.5">
          {confirmDel ? (
            <DelConfirm
              label="esta foto"
              onConfirm={() => { onDelete(); setConfirmDel(false); }}
              onCancel={() => setConfirmDel(false)}
            />
          ) : (
            <div className="flex gap-1.5 justify-end">
              <button onClick={onOpenLightbox} title="Ver"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 cursor-pointer transition-colors">
                <IcoZoom />
              </button>
              <button onClick={onEdit} title="Editar"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 cursor-pointer transition-colors">
                <IcoEdit />
              </button>
              {!isPortada && (
                <button onClick={onSetPortada} title="Usar como portada"
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-[#FCD34D]/80 cursor-pointer transition-colors">
                  <IcoPortada />
                </button>
              )}
              <button onClick={() => setConfirmDel(true)} title="Eliminar"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-red-600/80 cursor-pointer transition-colors">
                <IcoTrash />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function GaleriaPage() {
  const [albumes,     setAlbumes]     = useState([]);
  const [fotos,       setFotos]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingF,    setLoadingF]    = useState(false);
  const [error,       setError]       = useState(null);
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [albumModal,  setAlbumModal]  = useState(null);   // null | "new" | album obj
  const [fotoEdit,    setFotoEdit]    = useState(null);
  const [lightbox,    setLightbox]    = useState(null);   // índice o null

  // ── Fetch álbumes ───────────────────────────────────────────────────────────
  const fetchAlbumes = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/galeria");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setAlbumes(json.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAlbumes(); }, [fetchAlbumes]);

  // ── Fetch fotos de un álbum ─────────────────────────────────────────────────
  const fetchFotos = useCallback(async (albumId) => {
    setLoadingF(true);
    try {
      const res  = await fetch(`/api/galeria?fotos=1&album_id=${albumId}`);
      const json = await res.json();
      if (!json.ok) return;
      setFotos(json.data);
    } catch {}
    finally { setLoadingF(false); }
  }, []);

  const openAlbum = useCallback((album) => {
    setActiveAlbum(album);
    fetchFotos(album.id);
  }, [fetchFotos]);

  // ── Handlers álbum ──────────────────────────────────────────────────────────
  const handleAlbumSaved = useCallback((data) => {
    setAlbumes(prev => {
      const idx = prev.findIndex(a => a.id === data.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = { ...next[idx], ...data }; return next; }
      return [{ ...data, total_fotos: 0 }, ...prev];
    });
    if (activeAlbum?.id === data.id) setActiveAlbum(a => ({ ...a, ...data }));
    setAlbumModal(null);
  }, [activeAlbum]);

  const handleDeleteAlbum = useCallback(async (id) => {
    await fetch(`/api/galeria?id=${id}`, { method: "DELETE", headers: authHeaders() });
    setAlbumes(prev => prev.filter(a => a.id !== id));
    if (activeAlbum?.id === id) setActiveAlbum(null);
  }, [activeAlbum]);

  // ── Handlers fotos ──────────────────────────────────────────────────────────
  const handleFotosUploaded = useCallback((newFotos) => {
    setFotos(prev => [...prev, ...newFotos]);
    setAlbumes(prev => prev.map(a => a.id === activeAlbum?.id
      ? { ...a, total_fotos: a.total_fotos + newFotos.length, portada_url: a.portada_url || newFotos[0]?.url || "" }
      : a));
  }, [activeAlbum]);

  const handleFotoSaved = useCallback((data) => {
    setFotos(prev => prev.map(f => f.id === data.id ? data : f));
    setFotoEdit(null);
  }, []);

  const handleDeleteFoto = useCallback(async (id) => {
    await fetch(`/api/galeria?fotos=1&id=${id}`, { method: "DELETE", headers: authHeaders() });
    setFotos(prev => prev.filter(f => f.id !== id));
    setAlbumes(prev => prev.map(a => a.id === activeAlbum?.id
      ? { ...a, total_fotos: Math.max(0, a.total_fotos - 1) } : a));
  }, [activeAlbum]);

  const handleSetPortada = useCallback(async (albumId, url) => {
    await fetch(`/api/galeria?id=${albumId}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body:    JSON.stringify({ portada_url: url }),
    });
    setAlbumes(prev => prev.map(a => a.id === albumId ? { ...a, portada_url: url } : a));
    setActiveAlbum(a => a ? { ...a, portada_url: url } : a);
  }, []);

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const totalFotos = useMemo(() => albumes.reduce((s, a) => s + a.total_fotos, 0), [albumes]);

  // ── Vista detalle ───────────────────────────────────────────────────────────
  if (activeAlbum) {
    return (
      <div className="p-4 sm:p-6">
        <AlbumDetail
          album={activeAlbum}
          fotos={fotos}
          loading={loadingF}
          onBack={() => { setActiveAlbum(null); setFotos([]); }}
          onEditAlbum={a => setAlbumModal(a)}
          onFotosUploaded={handleFotosUploaded}
          onEditFoto={f => setFotoEdit(f)}
          onDeleteFoto={handleDeleteFoto}
          onSetPortada={handleSetPortada}
          onOpenLightbox={i => setLightbox(i)}
        />

        {albumModal && albumModal !== "new" && (
          <AlbumModal initial={albumModal} onClose={() => setAlbumModal(null)} onSaved={handleAlbumSaved} />
        )}

        {fotoEdit && (
          <FotoEditModal foto={fotoEdit} onClose={() => setFotoEdit(null)} onSaved={handleFotoSaved} />
        )}

        {lightbox !== null && (
          <Lightbox
            fotos={fotos}
            index={lightbox}
            onClose={() => setLightbox(null)}
            onNext={() => setLightbox(i => Math.min(i + 1, fotos.length - 1))}
            onPrev={() => setLightbox(i => Math.max(i - 1, 0))}
          />
        )}
      </div>
    );
  }

  // ── Vista lista ─────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-0.5">Galería</h1>
          <p className="text-sm text-slate-400">Álbumes fotográficos de Bethel</p>
        </div>
        <button onClick={() => setAlbumModal("new")}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 cursor-pointer transition-colors">
          <IcoPlus /> Nuevo álbum
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Álbumes",      value: albumes.length, accent: "#FCD34D" },
          { label: "Total fotos",  value: totalFotos,     accent: "#60a5fa" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: accent }} />
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mb-2">{label}</p>
            <p className="text-2xl font-semibold text-slate-900">{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Grid de álbumes */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <i className="ti ti-alert-circle text-[32px] text-red-300" aria-hidden="true" />
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={fetchAlbumes} className="text-sm text-slate-500 underline cursor-pointer">Reintentar</button>
        </div>
      ) : albumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <span className="text-slate-300"><IcoImage /></span>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium">No hay álbumes creados</p>
            <p className="text-slate-300 text-xs mt-0.5">Crea el primero para empezar a subir fotos</p>
          </div>
          <button onClick={() => setAlbumModal("new")}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 cursor-pointer transition-colors">
            <IcoPlus /> Crear primer álbum
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albumes.map(album => (
            <AlbumCard
              key={album.id}
              album={album}
              onEdit={a => setAlbumModal(a)}
              onDelete={handleDeleteAlbum}
              onClick={() => openAlbum(album)}
            />
          ))}
        </div>
      )}

      {/* Modal álbum */}
      {albumModal && (
        <AlbumModal
          initial={albumModal === "new" ? null : albumModal}
          onClose={() => setAlbumModal(null)}
          onSaved={handleAlbumSaved}
        />
      )}
    </div>
  );
}