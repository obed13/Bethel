import React from 'react'

const AddBtn = ({ onClick, label = "Añadir" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-[12px] text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <i className="ti ti-plus text-[13px]" aria-hidden="true" /> {label}
    </button>
  );
}

export default AddBtn