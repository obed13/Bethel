import Icon from "./Icon";

const TopBar = () => (
  <div className="bg-brand-DEFAULT text-surface text-xs py-2 hidden ms:block">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ms:flex-row justify-between items-center gap-2">
      <div className="flex items-center gap-4">
        <a
          href="tel:+34690717991"
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <Icon name="phone" size={14} />
          <span>+52 686 562 2298</span>
        </a>
        <span className="hidden sm:flex items-center gap-1">
          <Icon name="map-pin" size={14} /> 
          Rio Sta Cruz 3223, Villa Verde, 21395 B.C.
        </span>
      </div>
      <div className="flex items-center gap-3">
        {[
          { name: "instagram", label: "Instagram", href: "https://www.instagram.com/cfcbethel"},
          { name: "facebook", label: "Facebook", href: "https://www.facebook.com/CFCBethelMexicali"},
          { name: "youtube", label: "YouTube", href: "https://www.youtube.com/@CentroFamiliarCristianoBethel"},
        ].map((s) => (
          <a
            key={s.name}
            href={s.href}
            className="hover:text-white transition-colors"
            aria-label={s.label}
            target="_blank"
          >
            <Icon name={s.name} size={16} />
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default TopBar;
