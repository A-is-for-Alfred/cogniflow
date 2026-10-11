import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-24 px-6 md:px-16 overflow-hidden relative"
      style={{ backgroundColor: "#7C3AED" }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ backgroundColor: "#A78BFA", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full opacity-15"
          style={{ backgroundColor: "#DDD6FE", filter: "blur(80px)" }}
        />
      </div>

      <div
        ref={ref}
        className={`relative z-10 max-w-3xl mx-auto text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
          Cada líder merece<br />un lugar para crecer.
        </h2>
        <p className="text-base md:text-lg text-white/70 max-w-lg mx-auto mb-10 leading-relaxed">
          El burnout, el estrés y el estancamiento no son inevitables. Cogniflow ofrece la escucha empática, el seguimiento de metas y el análisis de bienestar que tu equipo necesita para alcanzar su máximo potencial — de forma sostenible.
        </p>
        <Link
          to="/lets-talk"
          className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap text-black"
          style={{ backgroundColor: "#EDE9FE" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#DDD6FE")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#EDE9FE")}
        >
          Solicitar demo
          <i className="ri-arrow-right-line"></i>
        </Link>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-medium text-white/70">
          <div className="flex items-center justify-center gap-2">
            <i className="ri-lock-line text-lg" style={{ color: "#A78BFA" }}></i>
            Conversaciones 100% privadas
          </div>
          <div className="flex items-center justify-center gap-2">
            <i className="ri-user-heart-line text-lg" style={{ color: "#A78BFA" }}></i>
            Coach humana + IA integradas
          </div>
          <div className="flex items-center justify-center gap-2">
            <i className="ri-smartphone-line text-lg" style={{ color: "#A78BFA" }}></i>
            Disponible en móvil y web
          </div>
        </div>
      </div>
    </section>
  );
}