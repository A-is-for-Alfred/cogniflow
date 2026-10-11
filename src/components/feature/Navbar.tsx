import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const platformLinks = [
  { label: "Compañero de IA conversacional", href: "/what-we-do" },
  { label: "Seguimiento de hábitos y metas", href: "/what-we-do" },
  { label: "Marcadores fisiológicos y wearables", href: "/what-we-do" },
  { label: "Neurofeedback y entrenamiento profundo", href: "/what-we-do" },
  { label: "Acompañamiento psicológico", href: "/what-we-do" },
  { label: "Panel de supervisores", href: "/what-we-do" },
  { label: "Reportes para líderes", href: "/what-we-do" },
  { label: "Notificaciones y recordatorios", href: "/what-we-do" },
];

const methodologyLinks = [
  { label: "Escucha empática con IA", href: "/how-we-work" },
  { label: "Técnica de preguntas socráticas", href: "/how-we-work" },
  { label: "Coaching extendido", href: "/how-we-work" },
  { label: "Fijación de objetivos SMART", href: "/how-we-work" },
  { label: "Análisis de patrones conductuales", href: "/how-we-work" },
  { label: "Evaluación de bienestar integral", href: "/how-we-work" },
  { label: "Retroalimentación continua", href: "/how-we-work" },
];

interface DropdownProps {
  isOpen: boolean;
  links: { label: string; href: string }[];
  image: string;
  title: string;
  align?: "left" | "right";
}

function Dropdown({ isOpen, links, image, title, align = "left" }: DropdownProps) {
  return (
    <div
      className={`absolute top-full mt-3 w-[520px] bg-white rounded-2xl overflow-hidden transition-all duration-200 z-50 ${
        align === "right" ? "right-0" : "left-0"
      } ${
        isOpen
          ? "opacity-100 pointer-events-auto translate-y-0"
          : "opacity-0 pointer-events-none -translate-y-2"
      }`}
      style={{ boxShadow: "0 12px 48px rgba(0,0,0,0.14)" }}
    >
      <div className="flex">
        <a href="#" className="relative w-44 flex-shrink-0 overflow-hidden group">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            style={{ minHeight: "300px" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <span className="text-white font-semibold text-sm">{title}</span>
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mt-1">
              <i className="ri-arrow-right-line text-xs text-black"></i>
            </div>
          </div>
        </a>
        <div className="flex-1 p-5">
          <ul className="space-y-0.5">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="block text-sm text-gray-600 hover:text-black hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-150 cursor-pointer"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = (name: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setOpenDropdown(name);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 md:px-8 lg:px-16 pointer-events-none">
        <nav
          ref={navRef}
          className="pointer-events-auto w-full rounded-full px-4 py-2 flex items-center justify-between transition-all duration-300"
          style={{
            backgroundColor: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: scrolled ? "0 4px 32px rgba(91,46,230,0.12)" : "0 4px 32px rgba(91,46,230,0.08)",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-base tracking-tight text-black whitespace-nowrap pl-1"
          >
            <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#A78BFA" }}>
              <i className="ri-brain-line text-white text-sm"></i>
            </span>
            Cogniflow
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {/* Platform dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("platform")}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to="/what-we-do"
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-black rounded-full transition-colors cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: openDropdown === "platform" ? "#F5F0FF" : "" }}
              >
                La Plataforma
                <i className={`ri-arrow-down-s-line text-base transition-transform duration-200 ${openDropdown === "platform" ? "rotate-180" : ""}`}></i>
              </Link>
              <Dropdown
                isOpen={openDropdown === "platform"}
                links={platformLinks}
                image="https://readdy.ai/api/search-image?query=person%20having%20a%20calm%20conversation%20with%20AI%20interface%20on%20a%20smartphone%20warm%20soft%20light%20modern%20minimal%20workspace%20focus%20wellbeing%20technology&width=440&height=650&seq=nav01&orientation=portrait"
                title="La Plataforma"
                align="left"
              />
            </div>

            {/* Methodology dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("methodology")}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to="/how-we-work"
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-black rounded-full transition-colors cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: openDropdown === "methodology" ? "#F5F0FF" : "" }}
              >
                Metodología
                <i className={`ri-arrow-down-s-line text-base transition-transform duration-200 ${openDropdown === "methodology" ? "rotate-180" : ""}`}></i>
              </Link>
              <Dropdown
                isOpen={openDropdown === "methodology"}
                links={methodologyLinks}
                image="https://readdy.ai/api/search-image?query=coach%20having%20a%20deep%20focused%20conversation%20with%20employee%20in%20a%20bright%20modern%20office%20empathy%20listening%20professional%20development%20growth&width=440&height=650&seq=nav02&orientation=portrait"
                title="Metodología"
                align="left"
              />
            </div>

            <Link
              to="/industries"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black rounded-full transition-colors cursor-pointer whitespace-nowrap"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F5F0FF")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
            >
              Para Empresas
            </Link>
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/lets-talk")}
              className="hidden md:flex items-center gap-2 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: "#7C3AED" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#6D28D9")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#7C3AED")}
            >
              Solicitar demo
              <i className="ri-arrow-right-line"></i>
            </button>
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <i className={`text-xl ${mobileOpen ? "ri-close-line" : "ri-menu-line"}`}></i>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "72px" }}
      >
        <div className="overflow-y-auto h-full px-6 py-6 space-y-1">
          {/* Platform accordion */}
          <div className="border-b border-gray-100">
            <button
              className="flex items-center justify-between w-full py-3 text-base font-medium cursor-pointer"
              onClick={() => setMobileAccordion(mobileAccordion === "platform" ? null : "platform")}
            >
              <Link to="/what-we-do" onClick={() => setMobileOpen(false)} className="flex-1 text-left">
                La Plataforma
              </Link>
              <i className={`ri-arrow-down-s-line text-xl transition-transform duration-200 ${mobileAccordion === "platform" ? "rotate-180" : ""}`}></i>
            </button>
            {mobileAccordion === "platform" && (
              <div className="pb-3 space-y-1 pl-3">
                {platformLinks.map((l) => (
                  <Link key={l.label} to={l.href} className="block py-2 text-sm text-gray-600 hover:text-black cursor-pointer" onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Methodology accordion */}
          <div className="border-b border-gray-100">
            <button
              className="flex items-center justify-between w-full py-3 text-base font-medium cursor-pointer"
              onClick={() => setMobileAccordion(mobileAccordion === "methodology" ? null : "methodology")}
            >
              <Link to="/how-we-work" onClick={() => setMobileOpen(false)} className="flex-1 text-left">
                Metodología
              </Link>
              <i className={`ri-arrow-down-s-line text-xl transition-transform duration-200 ${mobileAccordion === "methodology" ? "rotate-180" : ""}`}></i>
            </button>
            {mobileAccordion === "methodology" && (
              <div className="pb-3 space-y-1 pl-3">
                {methodologyLinks.map((l) => (
                  <Link key={l.label} to={l.href} className="block py-2 text-sm text-gray-600 hover:text-black cursor-pointer" onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/industries" className="block py-3 text-base font-medium border-b border-gray-100 cursor-pointer" onClick={() => setMobileOpen(false)}>
            Para Empresas
          </Link>

          <div className="pt-4">
            <Link
              to="/lets-talk"
              className="flex items-center justify-center gap-2 text-white text-sm font-medium px-5 py-3 rounded-full w-full cursor-pointer"
              style={{ backgroundColor: "#7C3AED" }}
              onClick={() => setMobileOpen(false)}
            >
              Solicitar demo <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}