import {useState} from 'react'

const IcoTrash   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

const DelConfirmBtn = ({ onConfirm }) => {
  const [c, setC] = useState(false);
    if (c) return (
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-slate-500">¿Eliminar?</span>
        <button onClick={() => { onConfirm(); setC(false); }} className="h-7 px-2.5 rounded-lg bg-red-600 text-white text-[11px] font-medium cursor-pointer hover:bg-red-700">Sí</button>
        <button onClick={() => setC(false)} className="h-7 px-2.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] cursor-pointer hover:bg-slate-50">No</button>
      </div>
    );
    return (
      <button onClick={() => setC(true)}
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer shrink-0">
        <IcoTrash />
      </button>
    );
}

export default DelConfirmBtn