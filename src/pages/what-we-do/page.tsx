import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const features = [
  {
    icon: "ri-chat-voice-line",
    label: "01",
    title: "Compañero conversacional de IA",
    description:
      "Una IA entrenada con las mejores técnicas de coaching que escucha de forma empática, formula preguntas poderosas y acompaña a cada persona en un proceso de autoconocimiento profundo. No da respuestas — hace las preguntas correctas para que cada quien encuentre las suyas.",
    color: "#7C3AED",
    textColor: "text-white",
    tags: ["Escucha empática", "Preguntas socráticas", "Conversación natural", "Privacidad total"],
  },
  {
    icon: "ri-focus-3-line",
    label: "02",
    title: "Seguimiento de hábitos y metas",
    description:
      "Cogniflow acompaña a las personas en la fijación de objetivos específicos y medibles, y les da seguimiento en el tiempo. Notificaciones inteligentes, recordatorios contextuales y análisis de progreso aseguran que el cambio se convierta en hábito real.",
    color: "#EDE9FE",
    textColor: "text-black",
    tags: ["Objetivos SMART", "Recordatorios", "Análisis de progreso", "Seguimiento continuo"],
  },
  {
    icon: "ri-heart-pulse-line",
    label: "03",
    title: "Bienestar fisiológico y wearables",
    description:
      "Integramos datos de dispositivos wearables y marcadores fisiológicos para tener una visión completa del estado real de cada persona: calidad de sueño, variabilidad de frecuencia cardíaca, niveles de estrés y más. La salud no es solo lo que se dice — es lo que el cuerpo muestra.",
    color: "#A78BFA",
    textColor: "text-white",
    tags: ["Wearables", "HRV", "Calidad de sueño", "Biomarcadores"],
  },
  {
    icon: "ri-brain-line",
    label: "04",
    title: "Neurofeedback y entrenamiento profundo",
    description:
      "Para quienes quieren ir más lejos, Cogniflow incluye módulos de neurofeedback y entrenamiento cognitivo profundo. Desarrollamos la capacidad de atención, regulación emocional y toma de decisiones bajo presión — habilidades clave para cualquier líder.",
    color: "#5B21B6",
    textColor: "text-white",
    tags: ["Neurofeedback", "Regulación emocional", "Cognición ejecutiva", "Enfoque"],
  },
  {
    icon: "ri-shield-user-line",
    label: "05",
    title: "Panel de supervisores y reportes",
    description:
      "Los líderes y supervisores acceden a reportes consolidados sobre el estado general de sus equipos sin acceder a ninguna conversación privada. Identifican tendencias, riesgos de burnout y oportunidades de apoyo de forma oportuna, respetando la privacidad de cada persona.",
    color: "#F9F6FF",
    textColor: "text-black",
    tags: ["Reportes agregados", "Alertas tempranas", "Privacidad garantizada", "Dashboard ejecutivo"],
  },
  {
    icon: "ri-psychotherapy-line",
    label: "06",
    title: "Acompañamiento psicológico integrado",
    description:
      "Cuando la conversación llega a temas que requieren un profesional de la salud mental, Cogniflow conecta con psicólogos certificados. No reemplazamos la terapia — la complementamos y facilitamos el acceso para quienes más lo necesitan.",
    color: "#DDD6FE",
    textColor: "text-black",
    tags: ["Psicólogos certificados", "Derivación inteligente", "Salud mental", "Cuidado integral"],
  },
];

const process = [
  {
    step: "Onboarding",
    description: "La plataforma conoce a cada persona: sus objetivos, áreas de desarrollo y contexto dentro de la organización.",
  },
  {
    step: "Conversación",
    description: "Sesiones diarias de acompañamiento conversacional — breves, profundas y completamente privadas.",
  },
  {
    step: "Seguimiento",
    description: "Metas definidas, hábitos rastreados, datos fisiológicos integrados. El progreso se hace visible.",
  },
  {
    step: "Impacto",
    description: "Reportes para la organización, intervención de la coach humana y crecimiento medible en cada persona.",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-2xl p-8 md:p-10 flex flex-col gap-6 cursor-pointer transition-transform duration-300"
      style={{
        backgroundColor: feature.color,
        opacity: 0,
        transform: "translateY(40px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        transitionDelay: `${index * 0.08}s`,
        scale: hovered ? "1.01" : "1",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${feature.textColor === "text-white" ? "bg-white/20" : "bg-black/8"}`}
          style={{ backgroundColor: feature.textColor === "text-white" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)" }}
        >
          <i className={`${feature.icon} text-xl ${feature.textColor}`}></i>
        </div>
        <span className={`text-xs font-bold tracking-widest uppercase ${feature.textColor} opacity-40`}>
          {feature.label}
        </span>
      </div>

      <div>
        <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${feature.textColor}`}>{feature.title}</h3>
        <p className={`text-sm md:text-base leading-relaxed ${feature.textColor} opacity-75`}>
          {feature.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto">
        {feature.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              backgroundColor: feature.textColor === "text-white" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
              color: feature.textColor === "text-white" ? "white" : "black",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WhatWeDo() {
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
      <section className="relative pt-40 pb-24 px-6 md:px-16 overflow-hidden" style={{ backgroundColor: "#F9F6FF" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-8%] right-[-4%] w-[420px] h-[420px] rounded-full opacity-30" style={{ backgroundColor: "#DDD6FE", filter: "blur(80px)" }} />
          <div className="absolute bottom-[5%] left-[-4%] w-[320px] h-[320px] rounded-full opacity-20" style={{ backgroundColor: "#A78BFA", filter: "blur(90px)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-20">
          <div ref={heroRef} className="flex-1 min-w-0 text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#7C3AED" }}>
              La Plataforma
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-black leading-none mb-6">
              Todo lo que<br />
              <span style={{ color: "#7C3AED" }}>necesita un líder</span><br />
              para crecer.
            </h1>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-xl mb-10 mx-auto lg:mx-0">
              Cogniflow es una plataforma integral de desarrollo humano: IA conversacional, seguimiento de metas, bienestar fisiológico y coaching humano en un solo lugar.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Link
                to="/lets-talk"
                className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap text-white"
                style={{ backgroundColor: "#7C3AED" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#6D28D9")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#7C3AED")}
              >
                Solicitar demo
                <i className="ri-arrow-right-line"></i>
              </Link>
            </div>
          </div>

          <div className="flex-shrink-0 w-full lg:w-auto">
            <div className="relative rounded-3xl overflow-hidden w-full lg:w-[500px]" style={{ height: "380px" }}>
              <img
                src="https://readdy.ai/api/search-image?query=person%20looking%20at%20holographic%20AI%20interface%20dashboard%20wellness%20metrics%20goals%20professional%20development%20purple%20violet%20glow%20futuristic%20clean%20modern%20design%20corporate&width=1000&height=760&seq=wwd01&orientation=portrait"
                alt="Plataforma Cogniflow"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-5 left-5 right-5 flex justify-between">
                <div className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "rgba(124,58,237,0.9)" }}>
                  <i className="ri-shield-check-line mr-1"></i> 100% privado
                </div>
                <div className="px-4 py-2 rounded-xl text-xs font-bold text-black" style={{ backgroundColor: "rgba(237,233,254,0.95)" }}>
                  <i className="ri-smartphone-line mr-1"></i> App + Web
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 md:px-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
              Funcionalidades
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
              Seis dimensiones de<br />desarrollo humano.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Strip */}
      <section className="px-6 md:px-16 py-20" style={{ backgroundColor: "#7C3AED" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white/50">
            Cómo funciona
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-14 leading-tight">
            Simple de usar, profundo en impacto.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((p, i) => (
              <div key={p.step} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                    style={{ backgroundColor: "#A78BFA" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>
                <h3 className="text-xl font-bold text-white">{p.step}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-16 py-24" style={{ backgroundColor: "#F9F6FF" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-4">
              &iquest;Lista para amplificar<br />
              <span style={{ color: "#7C3AED" }}>tu impacto como coach?</span>
            </h2>
            <p className="text-base text-gray-500 max-w-md">
              Cogniflow te permite llegar a cada persona de la organización sin perder la calidad y profundidad del acompañamiento.
            </p>
          </div>
          <div className="flex-shrink-0">
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
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}