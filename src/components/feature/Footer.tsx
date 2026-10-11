import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="pt-16 pb-10 px-6 md:px-16" style={{ backgroundColor: "#1A0A2E" }}>
      <div className="max-w-7xl mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-16 border-b border-white/10">
          {/* Left: CTA text */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#A78BFA" }}>
                <i className="ri-brain-line text-white text-sm"></i>
              </span>
              <span className="text-white font-bold text-lg">Cogniflow</span>
            </div>
            <p className="text-base md:text-lg font-medium text-white/60 max-w-md leading-relaxed mb-8">
              Llevamos el potencial humano al siguiente nivel. IA + coaching humano para un desarrollo integral que se siente en la empresa y en la vida de cada persona.
            </p>
            <Link
              to="/lets-talk"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap text-black text-sm"
              style={{ backgroundColor: "#A78BFA" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#8B5CF6")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#A78BFA")}
            >
              Solicitar demo
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          {/* Right: Nav links */}
          <div className="flex justify-start md:justify-end">
            <div className="grid grid-cols-2 gap-x-16 gap-y-2">
              <ul className="space-y-2">
                {[
                  { label: "La Plataforma", to: "/what-we-do" },
                  { label: "Metodología", to: "/how-we-work" },
                  { label: "Para Empresas", to: "/industries" },
                  { label: "Nuestro enfoque", to: "/how-we-work" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-white/50 hover:text-white hover:underline transition-colors cursor-pointer">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {["Privacidad", "Términos de uso", "Contacto"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/50 hover:text-white hover:underline transition-colors cursor-pointer">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Big "Talk" section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 pb-12 border-b border-white/10">
          <div>
            <h2 className="text-6xl md:text-8xl font-bold text-white leading-none">
              Hablemos<br />
              <span
                className="underline decoration-8 underline-offset-4"
                style={{ color: "#A78BFA", textDecorationColor: "#A78BFA" }}
              >
                juntos
              </span>
            </h2>
          </div>
          <div className="space-y-6 text-sm text-white/50 leading-relaxed">
            <div>
              <p className="font-bold text-white mb-1">Alcance global</p>
              <p>Plataforma disponible en web y dispositivos móviles, con soporte para equipos distribuidos en cualquier región del mundo.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Privacidad primero</p>
              <p>Cada conversación es 100% privada para el colaborador. Los supervisores solo reciben reportes agregados, nunca el contenido personal.</p>
            </div>
            <div>
              <a href="mailto:hola@cogniflow.ai" className="font-bold text-white hover:underline cursor-pointer">
                hola@cogniflow.ai
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 text-sm text-white/30">
          <span>Copyright &copy; 2026 Cogniflow. Todos los derechos reservados.</span>
          <div className="flex items-center gap-6">
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer nofollow" className="hover:text-white transition-colors cursor-pointer">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}