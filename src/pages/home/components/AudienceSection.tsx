import { useEffect, useRef, useState } from "react";

const personas = [
  {
    icon: "ri-user-star-line",
    title: "Líderes y directivos",
    description:
      "Los que cargan más peso, tienen menos espacio para parar. Cogniflow les da un espacio seguro para reflexionar, procesar el estrés y seguir creciendo como personas y como líderes.",
    color: "#7C3AED",
    textColor: "text-white",
  },
  {
    icon: "ri-group-2-line",
    title: "Equipos de alto rendimiento",
    description:
      "Personas que quieren ir más lejos pero necesitan acompañamiento en el camino. Nuestro sistema identifica patrones, refuerza buenos hábitos y alerta cuando el desgaste se acerca.",
    color: "#EDE9FE",
    textColor: "text-black",
  },
  {
    icon: "ri-building-4-line",
    title: "Organizaciones que se preocupan",
    description:
      "Empresas que entienden que cuidar a sus personas no es un lujo, es una estrategia. Cogniflow demuestra que la salud y el bienestar se traducen directamente en resultados.",
    color: "#A78BFA",
    textColor: "text-white",
  },
];

export default function AudienceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-6 md:px-16" style={{ backgroundColor: "#F9F6FF" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
            Para quién es Cogniflow
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
            Diseñado para quienes lideran — y para quienes cuidan de ellos.
          </h2>
        </div>

        <div ref={ref} className={`grid grid-cols-1 md:grid-cols-3 gap-5 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {personas.map((p, i) => (
            <div
              key={p.title}
              className={`rounded-2xl p-8 flex flex-col gap-5 ${p.textColor}`}
              style={{ backgroundColor: p.color, transitionDelay: `${i * 100}ms` }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <i className={`${p.icon} text-xl`}></i>
              </div>
              <h3 className="text-xl font-bold">{p.title}</h3>
              <p className="text-sm leading-relaxed opacity-80">{p.description}</p>
            </div>
          ))}
        </div>

        {/* Full-width visual section */}
        <div className="mt-16 relative rounded-3xl overflow-hidden" style={{ height: "400px" }}>
          <img
            src="https://readdy.ai/api/search-image?query=diverse%20team%20of%20professionals%20in%20a%20bright%20modern%20office%20laughing%20collaborating%20together%20positive%20team%20culture%20corporate%20wellness%20wellbeing%20at%20work%20purple%20accent%20real%20candid%20moments&width=1400&height=400&seq=aud01&orientation=landscape"
            alt="Equipo Cogniflow"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16 max-w-xl">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "#A78BFA" }}
            >
              Nuestro propósito
            </p>
            <p className="text-2xl md:text-3xl font-bold text-white leading-snug">
              &ldquo;Queremos que cada persona en tu empresa sienta que alguien la escucha, la entiende y cree en su potencial.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}