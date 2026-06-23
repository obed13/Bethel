import React from 'react'

const Toggle = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3 border-t border-slate-100">
      <span className="text-sm text-slate-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer",
          checked ? "bg-slate-950" : "bg-slate-200",
        ].join(" ")}
      >
        <span className={[
          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200",
          checked ? "translate-x-4.5" : "translate-x-0.5",
        ].join(" ")} />
      </button>
    </div>
  );
}

export default Toggle