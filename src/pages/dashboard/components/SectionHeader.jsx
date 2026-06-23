import React from 'react'

const SectionHeader = ({ title, sub, onSave, saving, saved }) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-400">{sub}</p>
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={[
          "flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-medium transition-colors cursor-pointer",
          saved
            ? "bg-emerald-600 text-white"
            : "bg-slate-950 text-white hover:bg-slate-800",
          saving ? "opacity-60" : "",
        ].join(" ")}
      >
        <i className={`ti ${saving ? "ti-loader animate-spin" : saved ? "ti-check" : "ti-device-floppy"} text-[15px]`} aria-hidden="true" />
        {saving ? "Guardando…" : saved ? "Guardado" : "Guardar cambios"}
      </button>
    </div>
  );
}

export default SectionHeader