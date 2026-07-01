import React from 'react'

const SaveBtn = ({ saving, saved, onClick, label = "Guardar" }) => {
  return (
    <button type="button" onClick={onClick} disabled={saving}
      className={[
        "flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-60",
        saved ? "bg-emerald-600 text-white" : "bg-slate-950 text-white hover:bg-slate-800",
      ].join(" ")}>
      <i className={`ti ${saving ? "ti-loader animate-spin" : saved ? "ti-check" : "ti-device-floppy"} text-[14px]`} aria-hidden="true" />
      {saving ? "Guardando…" : saved ? "Guardado" : label}
    </button>
  );
}

export default SaveBtn;