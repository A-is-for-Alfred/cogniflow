import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const cards = [
  {
    title: "Escucha, no monologa.",
    description:
      "Cogniflow no da consejos genéricos. Formula preguntas profundas inspiradas en las técnicas de los mejores coaches del mundo, crea un espacio seguro donde cada persona puede explorar sus propios pensamientos y descubrir sus áreas de oportunidad por sí misma. Es la diferencia entre recibir instrucciones y tener una conversación que transforma.",
    cta: "Ver la plataforma",
    link: "/what-we-do",
    color: "#7C3AED",
    textColor: "text-white",
    btnColor: "bg-white text-black hover:bg-gray-100",
    labelColor: "rgba(255,255,255,0.5)",
    illustration: "https://readdy.ai/api/search-image?query=person%20sitting%20comfortably%20with%20headphones%20having%20a%20thoughtful%20conversation%20with%20AI%20assistant%20on%20smartphone%20warm%20purple%20ambient%20glow%20modern%20workspace%20introspective%20calm%20atmosphere&width=900&height=1200&seq=fc01&orientation=portrait",
  },
  {
    title: "La coach amplificada.",
    description:
      "No sustituimos a los coaches humanos — los potenciamos. Cogniflow extiende el alcance de tu coach principal a toda la organización, garantizando acompañamiento personalizado para cada líder, en cada nivel. La coach recibe información consolidada y puede intervenir en el momento justo, donde más impacta.",
    cta: "Nuestra metodología",
    link: "/how-we-work",
    color: "#EDE9FE",
    textColor: "text-black",
    btnColor: "bg-black text-white hover:bg-gray-800",
    labelColor: "rgba(0,0,0,0.4)",
    illustration: "https://readdy.ai/api/search-image?query=professional%20coach%20and%20employee%20collaborating%20with%20digital%20dashboard%20data%20visualization%20warm%20office%20setting%20purple%20accent%20tones%20technology%20meets%20human%20connection&width=900&height=1200&seq=fc02&orientation=portrait",
  },
  {
    title: "Metas que se cumplen.",
    description:
      "No basta con identificar áreas de mejora — hay que actuar. Cogniflow acompaña a cada persona en la definición de objetivos específicos, medibles y alcanzables, y los sigue en el tiempo mediante notificaciones inteligentes. El hábito se construye día a día, conversación a conversación.",
    cta: "Para empresas",
    link: "/industries",
    color: "#A78BFA",
    textColor: "text-white",
    btnColor: "bg-white text-black hover:bg-gray-100",
    labelColor: "rgba(255,255,255,0.5)",
    illustration: "https://readdy.ai/api/search-image?query=person%20checking%20goals%20and%20habits%20on%20mobile%20app%20gentle%20celebration%20success%20minimal%20interface%20soft%20purple%20tones%20productivity%20tracking%20wellness%20journal%20morning%20routine&width=900&height=1200&seq=fc03&orientation=portrait",
  },
  {
    title: "Bienestar medible.",
    description:
      "Vamos más allá de las palabras. Cogniflow integra datos de wearables, marcadores fisiológicos y sesiones de neurofeedback para tener una visión 360° del estado real de cada persona. Estrés, calidad de sueño, carga cognitiva — todo en un solo lugar, con privacidad total.",
    cta: "Ver más",
    link: "/what-we-do",
    color: "#5B21B6",
    textColor: "text-white",
    btnColor: "bg-white text-black hover:bg-gray-100",
    labelColor: "rgba(255,255,255,0.5)",
    illustration: "https://readdy.ai/api/search-image?query=smartwatch%20biometric%20data%20health%20metrics%20dashboard%20person%20reviewing%20wellness%20data%20purple%20dark%20sleek%20interface%20modern%20technology%20health%20monitoring&width=900&height=1200&seq=fc04&orientation=portrait",
  },
];

function StickyCard({
  card,
  index,
  total,
  progress,
}: {
  card: typeof cards[0];
  index: number;
  total: number;
  progress: number;
}) {
  // Each card occupies 1/total of the total scroll range
  const segmentSize = 1 / total;
  const start = index * segmentSize;
  const end = (index + 1) * segmentSize;

  // Clamp progress to this card's segment
  const localProgress = Math.max(0, Math.min(1, (progress - start) / (end - start)));

  // First card is always fully visible (no scale/y transform needed as base)
  const scale = index === 0 ? 1 : 0.92 + localProgress * 0.08;
  const opacity = index === 0 ? 1 : 0.3 + localProgress * 0.7;

  return (
    <div
      className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden"
      style={{
        zIndex: index + 1,
        backgroundColor: card.color,
        transform: `scale(${scale})`,
        opacity,
        transition: "transform 0.1s linear, opacity 0.1s linear",
      }}
    >
      <div className="w-full h-full flex flex-col md:flex-row">
        {/* Text side */}
        <div className={`flex-1 flex flex-col justify-center px-12 md:px-20 lg:px-28 py-16 ${card.textColor}`}>
          <span
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: card.labelColor }}
          >
            0{index + 1} / 0{total}
          </span>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
            {card.title}
          </h3>
          <p className="text-base md:text-lg leading-relaxed opacity-80 max-w-lg mb-10">
            {card.description}
          </p>
          <div>
            <Link
              to={card.link}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-colors duration-200 cursor-pointer whitespace-nowrap ${card.btnColor}`}
            >
              {card.cta}
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>

        {/* Image side */}
        <div className="hidden md:block w-[38%] lg:w-[42%] h-full flex-shrink-0 overflow-hidden">
          <img
            src={card.illustration}
            alt={card.title}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}

export default function FeatureCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerTop = rect.top;
    const containerHeight = rect.height;
    const viewportHeight = window.innerHeight;

    // Total scrollable distance: container height minus one viewport (since last card is sticky at top)
    const scrollableDistance = containerHeight - viewportHeight;

    if (scrollableDistance <= 0) {
      setProgress(1);
      return;
    }

    // How far the container top has scrolled past the viewport top (negative = hasn't reached yet)
    const scrolled = -containerTop;
    const p = Math.max(0, Math.min(1, scrolled / scrollableDistance));
    setProgress(p);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial calculation
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section style={{ backgroundColor: "#F9F6FF" }}>
      <div className="py-16 px-8 md:px-32 max-w-none">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
          Por qué Cogniflow
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Desarrollo humano real, no solo charlas motivacionales.
        </h2>
      </div>

      <div
        ref={containerRef}
        style={{ height: `${cards.length * 100}vh` }}
        className="relative"
      >
        {cards.map((card, i) => (
          <StickyCard
            key={card.title}
            card={card}
            index={i}
            total={cards.length}
            progress={progress}
          />
        ))}
      </div>
    </section>
  );
}