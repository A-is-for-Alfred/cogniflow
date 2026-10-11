import { useEffect, useRef, useState } from "react";

const stats = [
  {
    number: "+34%",
    description: "Aumento promedio en productividad reportada por organizaciones que implementan Cogniflow en sus equipos de liderazgo.",
    color: "#7C3AED",
    textColor: "text-white",
    icon: "ri-line-chart-line",
  },
  {
    number: "-58%",
    description: "Reducción en indicadores de burnout en líderes con sesiones regulares de acompañamiento conversacional y seguimiento fisiológico.",
    color: "#EDE9FE",
    textColor: "text-black",
    icon: "ri-heart-pulse-line",
  },
  {
    number: "3.2x",
    description: "Mayor alcance de coaching por coach principal, extendiendo el acompañamiento personalizado a más personas sin perder calidad.",
    color: "#A78BFA",
    textColor: "text-white",
    icon: "ri-team-line",
  },
];

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
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
    <div
      ref={ref}
      className={`${stat.textColor} rounded-2xl p-8 md:p-10 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ backgroundColor: stat.color, transitionDelay: `${index * 120}ms` }}
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/10 mb-6">
        <i className={`${stat.icon} text-2xl`}></i>
      </div>
      <p className="text-6xl md:text-7xl font-bold mb-4 leading-none">{stat.number}</p>
      <p className="text-sm md:text-base leading-relaxed opacity-80 max-w-xs">{stat.description}</p>
    </div>
  );
}

export default function StatsSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTitleVisible(true); },
      { threshold: 0.2 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: sticky title */}
          <div
            ref={titleRef}
            className={`lg:sticky lg:top-32 transition-all duration-700 ${
              titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
              El impacto que se{" "}
              <strong
                className="underline decoration-4 underline-offset-4"
                style={{ textDecorationColor: "#A78BFA" }}
              >
                mide
              </strong>{" "}
              y se siente
            </h2>
            <p className="text-base text-gray-500 leading-relaxed max-w-md">
              No medimos el éxito por sesiones completadas, sino por cambios reales: en el desempeño, en la salud y en la felicidad de las personas dentro de la organización.
            </p>
          </div>

          {/* Right: stat cards */}
          <div className="space-y-5">
            {stats.map((stat, i) => (
              <StatCard key={stat.number} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}