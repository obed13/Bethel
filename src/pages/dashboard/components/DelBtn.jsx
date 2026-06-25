import { useState } from 'react'

const DelBtn = ({ onConfirm, label = "este elemento"  }) => {
  const [confirming, setConfirming] = useState(false);
  
  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-slate-500">¿Eliminar?</span>
        <button type="button" onClick={() => { onConfirm(); setConfirming(false); }}
          className="h-7 px-2.5 rounded-lg bg-red-600 text-white text-[11px] font-medium hover:bg-red-700 transition-colors cursor-pointer">
          Sí
        </button>
        <button type="button" onClick={() => setConfirming(false)}
          className="h-7 px-2.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] hover:bg-slate-50 transition-colors cursor-pointer">
          No
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} aria-label={`Eliminar ${label}`}
      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0">
      <i className="ti ti-trash text-[14px]" aria-hidden="true" />
    </button>
  );
}

export default DelBtn