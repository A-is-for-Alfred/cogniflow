import { useEffect, useRef, useState } from "react";

const articles = [
  {
    tags: ["Liderazgo", "Bienestar"],
    image: "https://readdy.ai/api/search-image?query=executive%20leader%20meditating%20or%20reflecting%20in%20a%20calm%20modern%20office%20natural%20light%20peaceful%20atmosphere%20mindfulness%20corporate%20wellness%20purple%20tones&width=600&height=380&seq=art01&orientation=landscape",
    title: "Por qué el burnout de los líderes es el mayor riesgo oculto en las organizaciones de hoy",
    href: "#",
  },
  {
    tags: ["IA & Coaching", "Innovación"],
    image: "https://readdy.ai/api/search-image?query=AI%20interface%20conversation%20on%20tablet%20human%20hands%20touching%20screen%20neural%20network%20visualization%20soft%20purple%20glow%20technology%20meets%20empathy%20modern%20workspace&width=600&height=380&seq=art02&orientation=landscape",
    title: "Cómo la inteligencia artificial puede formular mejores preguntas que un coach promedio",
    href: "#",
  },
  {
    tags: ["Hábitos", "Productividad"],
    image: "https://readdy.ai/api/search-image?query=person%20writing%20goals%20in%20a%20journal%20morning%20routine%20planner%20productivity%20focused%20workspace%20clean%20minimal%20aesthetic%20purple%20accent%20warm%20light&width=600&height=380&seq=art03&orientation=landscape",
    title: "El sistema de seguimiento de metas que realmente cambia comportamientos en el largo plazo",
    href: "#",
  },
  {
    tags: ["Salud", "Wearables"],
    image: "https://readdy.ai/api/search-image?query=smartwatch%20heart%20rate%20biometric%20data%20health%20tracking%20person%20reviewing%20wellness%20metrics%20modern%20clean%20design%20purple%20tones%20corporate%20professional&width=600&height=380&seq=art04&orientation=landscape",
    title: "Más allá de las palabras: qué nos dicen los marcadores fisiológicos sobre el bienestar real",
    href: "#",
  },
];

function ArticleCard({ article, index }: { article: typeof articles[0]; index: number }) {
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
    <div
      ref={ref}
      className={`group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <a href={article.href} className="block">
        <div className="relative overflow-hidden h-52">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-white text-xs font-semibold px-3 py-1 rounded-full"
                style={{ color: "#7C3AED" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-snug group-hover:underline">
            {article.title}
          </h3>
          <div
            className="mt-4 flex items-center gap-1 text-xs font-semibold transition-colors"
            style={{ color: "#7C3AED" }}
          >
            Leer más <i className="ri-arrow-right-line"></i>
          </div>
        </div>
      </a>
    </div>
  );
}

export default function ArticlesSection() {
  return (
    <section className="py-20 px-6 md:px-16" style={{ backgroundColor: "#EDE9FE" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
            Perspectivas
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-black">Ideas que mueven personas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {articles.map((article, i) => (
            <ArticleCard key={article.title} article={article} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}