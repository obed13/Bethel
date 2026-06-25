import React from 'react'
import DelBtn from './DelBtn';

function CollapsibleItem({ summary, onDelete, deleteLabel, defaultOpen, children }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 gap-3">
        <button type="button" onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 flex-1 text-left cursor-pointer">
          <i className={`ti ti-chevron-${open ? "up" : "down"} text-[13px] text-slate-400`} aria-hidden="true" />
          <span className="text-sm font-medium text-slate-700 truncate">{summary}</span>
        </button>
        <DelBtn onConfirm={onDelete} label={deleteLabel} />
      </div>
      {open && <div className="p-4 flex flex-col gap-3">{children}</div>}
    </div>
  )
}

export default CollapsibleItem