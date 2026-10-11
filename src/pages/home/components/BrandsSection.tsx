import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    quote: "Desde que implementamos Cogniflow, los líderes de nuestra empresa reportan sentirse más escuchados y con mayor claridad para tomar decisiones difíciles. El burnout bajó notablemente.",
    author: "Carolina Méndez",
    role: "Directora de Recursos Humanos",
    company: "Grupo Integra",
    avatar: "https://readdy.ai/api/search-image?query=professional%20latin%20woman%2040s%20HR%20director%20confident%20smile%20office%20environment%20warm%20natural%20light%20portrait&width=80&height=80&seq=tes01&orientation=squarish",
  },
  {
    quote: "Lo que me sorprendió fue que no siento que hablo con un bot. Las preguntas que hace Cogniflow me llevan a reflexiones que no habría tenido en ningún otro espacio dentro de la empresa.",
    author: "Rodrigo Valenzuela",
    role: "Gerente de Operaciones",
    company: "TecnoSoluciones",
    avatar: "https://readdy.ai/api/search-image?query=professional%20latin%20man%2035s%20operations%20manager%20business%20casual%20attire%20confident%20expression%20modern%20office&width=80&height=80&seq=tes02&orientation=squarish",
  },
  {
    quote: "Los reportes que recibo como supervisora me permiten apoyar a mi equipo sin invadir su privacidad. Es exactamente el equilibrio que necesitábamos.",
    author: "Fernanda Castro",
    role: "VP de Talento",
    company: "Finnovate MX",
    avatar: "https://readdy.ai/api/search-image?query=professional%20latin%20woman%2038s%20VP%20talent%20management%20confident%20leader%20business%20attire%20modern%20office%20setting&width=80&height=80&seq=tes03&orientation=squarish",
  },
];

function TestimonialCard({ t, index }: { t: typeof testimonials[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl p-7 flex flex-col gap-5 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <i key={i} className="ri-star-fill text-sm" style={{ color: "#7C3AED" }}></i>
        ))}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3 mt-auto">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img src={t.avatar} alt={t.author} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold text-black">{t.author}</p>
          <p className="text-xs text-gray-400">{t.role} · {t.company}</p>
        </div>
      </div>
    </div>
  );
}

export default function BrandsSection() {
  return (
    <section className="pb-20 px-6 md:px-16" style={{ backgroundColor: "#F9F6FF" }}>
      <div className="max-w-7xl mx-auto pt-20">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
          Testimonios
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-10">Lo que dicen quienes lo usan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.author} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}