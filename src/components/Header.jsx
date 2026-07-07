import Icon from "./Icon";
import { NAV_LINKS } from "../data";
import Logo from '../images/bethel.png'

const Header = ({ menuOpen, setMenuOpen }) => (
  <header
    className="sticky top-0 z-40 border-b border-slate-100 shadow-sm"
    style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)" }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <img src={Logo} alt="Centro Familiar Cristiano Bethel" className="w-15 h-15 object-cover" />
        <a href="#" className="text-2xl sd:text-[15px] sd:mr-auto xs:text-sm sm:text-xl sm:mr-auto font-semibold text-slate-950 tracking-tighter">
          Centro Familiar Cristiano Bethel<span className="text-slate-400">.</span>
        </a>

        <nav className="hidden lg:flex space-x-6 text-sm font-medium text-slate-600">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="hover:text-slate-950 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="px-4 py-2 rounded-full bg-brand-DEFAULT text-white hover:bg-slate-800 transition-colors font-medium"
          >
            Contacto
          </a>
        </nav>

        <button
        type="button"
          className="lg:hidden p-2 text-slate-600 hover:text-slate-950"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
  aria-expanded={menuOpen}
  aria-controls="mobile-menu"
        >
          <Icon name="menu" size={24} />
        </button>
      </div>
    </div>
  </header>
);

export default Header;
