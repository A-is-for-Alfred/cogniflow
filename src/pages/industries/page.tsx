import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const useCases = [
  {
    id: "leadership",
    label: "01",
    title: "Desarrollo de liderazgo",
    tagline: "Llevar a cada líder al pico de su potencial.",
    description:
      "Cogniflow acompaña a directores, gerentes y líderes de equipo en un proceso continuo de autoconocimiento, manejo del estrés y crecimiento personal. Porque los líderes que crecen, llevan a sus equipos al siguiente nivel.",
    color: "#7C3AED",
    textColor: "text-white",
    icon: "ri-user-star-line",
    tags: ["Coaching ejecutivo", "Manejo del estrés", "Toma de decisiones", "Regulación emocional"],
    image: "https://readdy.ai/api/search-image?query=confident%20executive%20leader%20standing%20by%20floor%20to%20ceiling%20window%20modern%20office%20city%20view%20purple%20violet%20ambient%20light%20professional%20development%20leadership%20growth&width=600&height=400&seq=ind01&orientation=landscape",
    stat: "Líderes al máximo",
  },
  {
    id: "wellness",
    label: "02",
    title: "Bienestar y prevención del burnout",
    tagline: "Detectar el desgaste antes de que se convierta en crisis.",
    description:
      "El burnout cuesta a las empresas millones en rotación y productividad perdida. Cogniflow identifica señales tempranas de agotamiento a través de conversaciones y datos fisiológicos, y actúa antes de que el problema escale.",
    color: "#EDE9FE",
    textColor: "text-black",
    icon: "ri-heart-pulse-line",
    tags: ["Prevención de burnout", "Wearables", "Alertas tempranas", "Salud integral"],
    image: "https://readdy.ai/api/search-image?query=person%20practicing%20mindfulness%20breathing%20exercise%20at%20desk%20calm%20modern%20workspace%20plants%20natural%20light%20wellness%20mental%20health%20corporate%20professional&width=600&height=400&seq=ind02&orientation=landscape",
    stat: "-58% burnout",
  },
  {
    id: "productivity",
    label: "03",
    title: "Productividad y hábitos de alto impacto",
    tagline: "Buenos hábitos que se sostienen en el tiempo.",
    description:
      "Cogniflow acompaña a las personas en la construcción de hábitos concretos y medibles: desde gestión del tiempo hasta comunicación efectiva. El sistema de seguimiento asegura que el cambio sea real y durable.",
    color: "#A78BFA",
    textColor: "text-white",
    icon: "ri-trophy-line",
    tags: ["Hábitos de alto impacto", "Gestión del tiempo", "Seguimiento de metas", "Ritmos productivos"],
    image: "https://readdy.ai/api/search-image?query=focused%20professional%20working%20on%20laptop%20with%20organized%20desk%20habit%20tracker%20planner%20productivity%20morning%20routine%20purple%20workspace%20clean%20minimal&width=600&height=400&seq=ind03&orientation=landscape",
    stat: "+34% productividad",
  },
  {
    id: "culture",
    label: "04",
    title: "Cultura organizacional y felicidad",
    tagline: "Empresas que se preocupan por sus personas.",
    description:
      "Las organizaciones que invierten en el bienestar de sus colaboradores tienen menor rotación, mayor compromiso y mejor reputación como empleadoras. Cogniflow es la señal más clara de que la empresa se preocupa por cada persona.",
    color: "#DDD6FE",
    textColor: "text-black",
    icon: "ri-building-4-line",
    tags: ["Cultura empresarial", "Employee experience", "Retención de talento", "Employer branding"],
    image: "https://readdy.ai/api/search-image?query=diverse%20team%20of%20employees%20smiling%20celebrating%20success%20in%20modern%20bright%20office%20positive%20work%20culture%20team%20spirit%20collaboration%20corporate%20culture&width=600&height=400&seq=ind04&orientation=landscape",
    stat: "Mayor retención",
  },
  {
    id: "coaching",
    label: "05",
    title: "Extensión del alcance del coach",
    tagline: "Una coach, el impacto de un equipo completo.",
    description:
      "El coaching individual es poderoso pero costoso de escalar. Cogniflow permite que una sola coach llegue a decenas o cientos de personas en la organización con la misma calidad y personalización, sin perder la calidez humana.",
    color: "#5B21B6",
    textColor: "text-white",
    icon: "ri-user-heart-line",
    tags: ["Coaching escalable", "Acompañamiento personalizado", "IA + coach humana", "Alcance organizacional"],
    image: "https://readdy.ai/api/search-image?query=female%20executive%20coach%20reviewing%20data%20dashboard%20iPad%20modern%20meeting%20room%20empathetic%20leader%20mentoring%20team%20digital%20transformation%20purple%20professional&width=600&height=400&seq=ind05&orientation=landscape",
    stat: "3.2x más alcance",
  },
  {
    id: "neurofeedback",
    label: "06",
    title: "Entrenamiento cognitivo avanzado",
    tagline: "Llevar la mente al siguiente nivel.",
    description:
      "Para organizaciones que quieren ir más lejos, Cogniflow incluye módulos de neurofeedback y entrenamiento cognitivo profundo. Desarrollamos atención sostenida, memoria de trabajo y toma de decisiones bajo presión.",
    color: "#F9F6FF",
    textColor: "text-black",
    icon: "ri-brain-line",
    tags: ["Neurofeedback", "Cognición ejecutiva", "Atención sostenida", "Rendimiento mental"],
    image: "https://readdy.ai/api/search-image?query=brain%20neural%20network%20visualization%20cognitive%20training%20technology%20modern%20interface%20purple%20glow%20high%20performance%20mental%20fitness%20executive%20mindset&width=600&height=400&seq=ind06&orientation=landscape",
    stat: "Pico cognitivo",
  },
];

function UseCaseCard({ uc, index }: { uc: typeof useCases[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(36px)";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, (index % 2) * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        backgroundColor: uc.color,
        transform: hovered ? "scale(1.015)" : "scale(1)",
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={uc.image}
          alt={uc.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold text-black whitespace-nowrap"
          style={{ backgroundColor: "#A78BFA" }}
        >
          {uc.stat}
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="text-white/50 text-xs font-bold tracking-widest uppercase">{uc.label}</span>
        </div>
      </div>

      <div className="p-7 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: uc.textColor === "text-white" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
            >
              <i className={`${uc.icon} text-lg ${uc.textColor}`}></i>
            </div>
            <h3 className={`text-2xl font-bold leading-tight ${uc.textColor}`}>{uc.title}</h3>
            <p className={`text-sm font-semibold mt-1 ${uc.textColor} opacity-60`}>{uc.tagline}</p>
          </div>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-transform duration-300 ${hovered ? "translate-x-1 -translate-y-1" : ""}`}
            style={{ backgroundColor: uc.textColor === "text-white" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
          >
            <i className={`ri-arrow-right-up-line text-base ${uc.textColor}`}></i>
          </div>
        </div>

        <p className={`text-sm leading-relaxed ${uc.textColor} opacity-75`}>{uc.description}</p>

        <div className="flex flex-wrap gap-2 mt-1">
          {uc.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: uc.textColor === "text-white" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                color: uc.textColor === "text-white" ? "white" : "black",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Industries() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    setTimeout(() => {
      el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 80);
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#F9F6FF" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 md:px-16 overflow-hidden" style={{ backgroundColor: "#F9F6FF" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-6%] w-[500px] h-[500px] rounded-full opacity-25" style={{ backgroundColor: "#DDD6FE", filter: "blur(100px)" }} />
          <div className="absolute bottom-[0%] left-[-5%] w-[380px] h-[380px] rounded-full opacity-20" style={{ backgroundColor: "#A78BFA", filter: "blur(90px)" }} />
        </div>

        <div ref={heroRef} className="relative max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#7C3AED" }}>
            Para Empresas
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-black leading-none">
              Seis formas<br />
              <span style={{ color: "#7C3AED" }}>de transformar</span><br />
              a tu equipo.
            </h1>

            <div className="lg:max-w-sm pb-2">
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                Cogniflow se adapta a las necesidades específicas de cada organización. Desde la prevención del burnout hasta el entrenamiento cognitivo avanzado.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: "ri-shield-check-line", text: "Privacidad garantizada" },
                  { icon: "ri-smartphone-line", text: "Móvil y web" },
                  { icon: "ri-user-heart-line", text: "IA + coach humana" },
                ].map((pill) => (
                  <div
                    key={pill.text}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: "#7C3AED" }}
                  >
                    <i className={`${pill.icon} text-base`}></i>
                    {pill.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="py-4 overflow-hidden" style={{ backgroundColor: "#7C3AED" }}>
        <div className="flex gap-8 whitespace-nowrap" style={{ animation: "marquee 22s linear infinite" }}>
          {[...Array(3)].map((_, ri) =>
            useCases.map((uc) => (
              <span
                key={`${uc.id}-${ri}`}
                className="text-white/70 text-sm font-semibold uppercase tracking-widest flex-shrink-0 flex items-center gap-3"
              >
                <i className={`${uc.icon} text-base`}></i>
                {uc.title}
                <span className="text-white/30 mx-1">·</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Use Cases Grid */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map((uc, i) => (
              <UseCaseCard key={uc.id} uc={uc} index={i} />
            ))}

            {/* CTA card */}
            <div
              className="rounded-2xl p-8 flex flex-col justify-between cursor-pointer group"
              style={{ backgroundColor: "#7C3AED", minHeight: "320px" }}
            >
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">¿Tienes un caso específico?</p>
                <h3 className="text-3xl font-bold text-white leading-tight mb-4">
                  Diseñamos la<br />solución contigo.
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Cada organización es diferente. Cuéntanos tu contexto y diseñamos juntos la implementación ideal de Cogniflow para tu empresa.
                </p>
              </div>
              <Link
                to="/lets-talk"
                className="inline-flex items-center gap-2 text-black text-sm font-bold px-6 py-3 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap self-start mt-6 group-hover:gap-3"
                style={{ backgroundColor: "#EDE9FE" }}
              >
                Hablemos
                <i className="ri-arrow-right-line"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bold quote strip */}
      <section className="px-6 md:px-16 py-20" style={{ backgroundColor: "#7C3AED" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1">
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5">Nuestro enfoque</p>
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Personas más felices.<br />
              <span style={{ color: "#A78BFA" }}>Empresas más fuertes.</span>
            </h2>
          </div>
          <div className="flex-1 max-w-md">
            <p className="text-white/70 text-base leading-relaxed mb-8">
              Creemos que el bienestar y la productividad no son opuestos — son la misma cosa. Cuando las personas se sienten bien, dan lo mejor de sí. Cogniflow es la herramienta que lo hace posible.
            </p>
            <div className="flex flex-wrap gap-3">
              {["IA conversacional", "Wearables", "Neurofeedback", "Coach humana", "Privacidad"].map((tag) => (
                <span key={tag} className="px-4 py-2 rounded-full text-sm font-semibold text-black" style={{ backgroundColor: "#EDE9FE" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-16 py-24" style={{ backgroundColor: "#F9F6FF" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-4">
              &iquest;Lista para cuidar<br />
              <span style={{ color: "#7C3AED" }}>a tu equipo?</span>
            </h2>
            <p className="text-base text-gray-500 max-w-md">
              Cuéntanos sobre tu organización y diseñamos juntos la implementación perfecta de Cogniflow.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <Link
              to="/lets-talk"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: "#7C3AED" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#6D28D9")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#7C3AED")}
            >
              Solicitar demo
              <i className="ri-arrow-right-line text-base"></i>
            </Link>
            <Link
              to="/what-we-do"
              className="inline-flex items-center gap-2 text-black font-semibold px-8 py-4 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap border-2 border-black/10 hover:border-black/30"
            >
              La plataforma
              <i className="ri-arrow-right-line text-base"></i>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}