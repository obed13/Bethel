import React from 'react'

export const Header = ({handleLogout,setSideOpen,handleBurger}) => {
  return (
    <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
        <button
            onClick={handleBurger}
            aria-label="Abrir menú"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
        >
            <i className="ti ti-menu-2 text-[18px]" aria-hidden="true" />
        </button>
        </div>
        <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
            <i className="ti ti-bell text-[17px]" aria-hidden="true" />
        </button>
        <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
            <i className="ti ti-logout text-[15px]" aria-hidden="true" />
            Salir
        </button>
        </div>
    </header>
  )
}
