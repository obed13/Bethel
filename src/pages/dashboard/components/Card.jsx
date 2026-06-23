import React from 'react'

const Card = ({ title, action, children }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold text-slate-900">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

export default Card