import Icon from "./Icon";
//import Logo from '../images/bethel.png'
import { useLandingSection } from "../hooks/useLanding";

const QUICK_LINKS = [
  ["Inicio", "#"],
  ["Nosotros", "#welcome"],
  ["Ministerios", "#services"],
  ["Contacto", "#contact"],
];

const LEGAL_LINKS = ["Privacidad", "Cookies", "Aviso Legal"];

const Footer = () => {
  const { data } = useLandingSection("footer");
  const { tagline, copyright, links } = data;

  return (
    <footer className="bg-brand-DEFAULT text-surface py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          
          <a href="#" className="text-2xl font-semibold tracking-tighter text-white mb-4 block">
            Centro Familiar Cristiano Bethel<span className="text-slate-500">.</span>
          </a>
          <p className="text-sm text-surface max-w-sm font-light leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-surface font-medium mb-4">Enlaces Rápidos</h4>
          <ul className="space-y-2 text-sm font-light">
            {QUICK_LINKS.map(([label, href]) => (
              <li key={label}>
                <a href={href} className="hover:text-white transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-surface font-medium mb-4">Legal</h4>
          <ul className="space-y-2 text-sm font-light">
            {LEGAL_LINKS.map((label) => (
              <li key={label}>
                <a href="#" className="hover:text-white transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-surface">
        <p>{copyright}</p>
        <div className="flex gap-4">
          <a href="https://www.facebook.com/CFCBethelMexicali" target="_blank" className="hover:text-white transition">
            <Icon name="facebook" size={16} />
          </a>
          <a href="https://www.instagram.com/cfcbethel" target="_blank" className="hover:text-white transition">
            <Icon name="instagram" size={16} />
          </a>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
