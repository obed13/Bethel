import Icon from "./Icon";
import { NAV_LINKS } from "../data";
import Logo from '../images/bethel.png'

const MobileMenu = ({ open, onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-white w-full h-full lg:hidden flex flex-col p-6 space-y-4"
    style={{
      transform: open ? "translateX(0)" : "translateX(100%)",
      transition: "transform 0.3s ease-in-out",
    }}
  >
    <div className="flex justify-between items-center mb-6">
      <div>
        <img src={Logo} alt="Centro Familiar Cristiano Bethel" className="w-auto h-10" />
      </div>
      <span className="text-2xl font-semibold tracking-tighter text-slate-950">
        CFCBethel
      </span>
      <button className="p-2 text-slate-500 hover:text-slate-950" onClick={onClose}>
        <Icon name="x" size={28} />
      </button>
    </div>

    {NAV_LINKS.map((l) => (
      <a
        key={l.label}
        href={l.href}
        onClick={onClose}
        className="text-lg font-medium text-slate-700 hover:text-slate-950 border-b border-slate-100 pb-2"
      >
        {l.label}
      </a>
    ))}

    <a
      href="#contact"
      onClick={onClose}
      className="text-lg font-medium text-slate-700 hover:text-slate-950 pb-2"
    >
      Contacto
    </a>
  </div>
);

export default MobileMenu;
