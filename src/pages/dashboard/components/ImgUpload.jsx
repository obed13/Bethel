import React from 'react'

const ImgUpload = ({ label, hint }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</label>
      <div className="flex items-center gap-3 px-3 py-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-slate-950 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
          <i className="ti ti-photo text-[18px] text-slate-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Haz clic para subir</p>
          <p className="text-[11px] text-slate-400">{hint}</p>
        </div>
      </div>
    </div>
  );
}

export default ImgUpload