import React from 'react'

const DelBtn = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Eliminar"
      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
    >
      <i className="ti ti-trash text-[14px]" aria-hidden="true" />
    </button>
  );
}

export default DelBtn