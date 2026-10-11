import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const pillars = [
  {
    id: "01",
    title: "Escucha empática estructurada",
    tagline: "Preguntar mejor para entender más profundo.",
    description:
      "Cogniflow no improvisa. Cada conversación sigue una estructura desarrollada a partir del estudio sistemático de los mejores coaches ejecutivos del mundo. Usamos técnicas como el cuestionamiento socrático, la entrevista motivacional y el modelo GROW para guiar a cada persona hacia sus propios insights — sin imponerle respuestas.",
    color: "#7C3AED",
    textColor: "text-white",
    icon: "ri-chat-voice-line",
    stat: "4+ técnicas",
    statLabel: "De coaching integradas",
    image: "https://readdy.ai/api/search-image?query=person%20in%20deep%20focused%20conversation%20looking%20thoughtful%20introspective%20warm%20lighting%20modern%20cozy%20setting%20soft%20purple%20tones%20empathy%20listening%20dialogue&width=600&height=400&seq=hww01&orientation=landscape",
  },
  {
    id: "02",
    title: "Identificación de áreas de oportunidad",
    tagline: "La persona encuentra, no nosotros le decimos.",
    description:
      "Nuestro proceso conversacional está diseñado para que cada persona identifique por sí misma sus propios patrones, bloqueos y fortalezas. La IA funciona como un espejo: devuelve lo que la persona ya sabe pero no ha podido articular. Esto genera un compromiso genuino con el cambio, no uno impuesto desde afuera.",
    color: "#EDE9FE",
    textColor: "text-black",
    icon: "ri-search-eye-line",
    stat: "100%",
    statLabel: "Introspección propia",
    image: "https://readdy.ai/api/search-image?query=person%20having%20an%20aha%20moment%20realization%20insight%20desk%20journaling%20light%20bulb%20modern%20minimal%20office%20environment%20productive%20reflection&width=600&height=400&seq=hww02&orientation=landscape",
  },
  {
    id: "03",
    title: "Definición de objetivos y metas SMART",
    tagline: "Sin metas claras, no hay cambio real.",
    description:
      "Una vez identificadas las áreas de oportunidad, Cogniflow acompaña a la persona en la construcción de objetivos específicos, medibles, alcanzables, relevantes y con tiempo definido. Estos objetivos se registran en la plataforma y se revisan periódicamente para asegurar que el progreso sea real y sostenible.",
    color: "#A78BFA",
    textColor: "text-white",
    icon: "ri-checkbox-circle-line",
    stat: "SMART",
    statLabel: "Marco de objetivos",
    image: "https://readdy.ai/api/search-image?query=person%20writing%20goals%20planner%20notebook%20digital%20tablet%20organized%20goal%20setting%20professional%20morning%20routine%20calm%20focused%20productive%20workspace%20purple%20accent&width=600&height=400&seq=hww03&orientation=landscape",
  },
  {
    id: "04",
    title: "Seguimiento continuo y notificaciones",
    tagline: "El hábito se construye en el día a día.",
    description:
      "Cogniflow acompaña a las personas más allá de las sesiones. Notificaciones inteligentes, check-ins cortos y recordatorios contextuales aseguran que el compromiso con el cambio no se pierda en la rutina. El sistema aprende de los patrones de cada usuario y adapta la frecuencia e intensidad del acompañamiento.",
    color: "#5B21B6",
    textColor: "text-white",
    icon: "ri-notification-3-line",
    stat: "24/7",
    statLabel: "Acompañamiento disponible",
    image: "https://readdy.ai/api/search-image?query=smartphone%20notification%20habit%20tracker%20app%20interface%20minimal%20clean%20purple%20glow%20person%20using%20phone%20checking%20progress%20wellness%20daily%20routine&width=600&height=400&seq=hww04&orientation=landscape",
  },
  {
    id: "05",
    title: "Medición fisiológica integral",
    tagline: "El cuerpo dice lo que a veces las palabras no.",
    description:
      "Integramos datos de wearables como frecuencia cardíaca, variabilidad de HRV, calidad de sueño y niveles de actividad física para complementar el análisis conversacional. Esta visión multidimensional permite detectar señales de estrés o burnout antes de que se conviertan en crisis.",
    color: "#DDD6FE",
    textColor: "text-black",
    icon: "ri-heart-pulse-line",
    stat: "360°",
    statLabel: "Visión del bienestar",
    image: "https://readdy.ai/api/search-image?query=biometric%20wearable%20device%20data%20visualization%20health%20dashboard%20smartphone%20app%20sleep%20quality%20heart%20rate%20variability%20clean%20modern%20UI%20purple%20wellness%20tech&width=600&height=400&seq=hww05&orientation=landscape",
  },
  {
    id: "06",
    title: "Integración con la coach humana",
    tagline: "La IA amplifica, el humano acompaña.",
    description:
      "Todo el proceso de Cogniflow está diseñado para potenciar el trabajo de la coach principal. Ella recibe información consolidada sobre el estado general de cada persona y puede intervenir con mayor precisión y oportunidad. La IA no sustituye su criterio — lo enriquece con datos que de otra forma nunca llegarían a sus manos.",
    color: "#F9F6FF",
    textColor: "text-black",
    icon: "ri-user-heart-line",
    stat: "3.2x",
    statLabel: "Mayor alcance del coach",
    image: "https://readdy.ai/api/search-image?query=female%20coach%20reviewing%20data%20dashboard%20tablet%20professional%20meeting%20room%20modern%20office%20warm%20light%20empathetic%20leader%20mentoring%20digital%20tools&width=600&height=400&seq=hww06&orientation=landscape",
  },
  {
    id: "07",
    title: "Reportes para supervisores con privacidad",
    tagline: "Información útil, sin invadir lo personal.",
    description:
      "Los supervisores y responsables de talento reciben reportes agregados con tendencias de bienestar, alertas de riesgo y oportunidades de apoyo — sin acceso a ninguna conversación individual. Esto permite tomar decisiones informadas y oportunas mientras se respeta la confianza de cada colaborador.",
    color: "#7C3AED",
    textColor: "text-white",
    icon: "ri-bar-chart-box-line",
    stat: "0 datos",
    statLabel: "Personales expuestos",
    image: "https://readdy.ai/api/search-image?query=HR%20manager%20reviewing%20team%20wellness%20dashboard%20report%20on%20computer%20modern%20office%20aggregate%20data%20visualization%20purple%20professional%20corporate%20analytics&width=600&height=400&seq=hww07&orientation=landscape",
  },
];

const principles = [
  {
    icon: "ri-lock-line",
    title: "Privacidad ante todo",
    description:
      "Cada conversación pertenece exclusivamente a la persona. Nadie más tiene acceso — ni supervisores, ni la empresa. La confianza es la base de cualquier proceso de cambio real.",
    color: "#7C3AED",
  },
  {
    icon: "ri-user-heart-line",
    title: "Humano primero",
    description:
      "La IA es un medio, no el fin. Cada decisión de diseño está orientada a que la persona se sienta escuchada, no procesada por un algoritmo.",
    color: "#EDE9FE",
  },
  {
    icon: "ri-seedling-line",
    title: "Cambio sostenible",
    description:
      "No buscamos quick wins. Buscamos cambios profundos que se mantengan en el tiempo y que impacten tanto en la vida profesional como personal.",
    color: "#A78BFA",
  },
  {
    icon: "ri-shield-check-line",
    title: "Evidencia, no intuición",
    description:
      "Nuestra metodología está fundamentada en décadas de investigación en psicología positiva, neurociencia y coaching ejecutivo. Nada que hacemos es arbitrario.",
    color: "#DDD6FE",
  },
];

function PillarCard({ m, index }: { m: typeof pillars[0]; index: number }) {
  const [open, setOpen] = useState(false);
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        backgroundColor: m.color,
        opacity: 0,
        transform: "translateY(32px)",
        transition: `opacity 0.55s ease ${index * 0.06}s, transform 0.55s ease ${index * 0.06}s`,
      }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between px-7 py-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}
            style={{ backgroundColor: m.textColor === "text-white" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
          >
            <i className={`${m.icon} text-lg ${m.textColor}`}></i>
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${m.textColor} opacity-40`}>
              {m.id}
            </span>
            <h3 className={`text-lg font-bold leading-tight ${m.textColor}`}>{m.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className={`text-xl font-bold ${m.textColor}`}>{m.stat}</p>
            <p className={`text-[10px] uppercase tracking-wide ${m.textColor} opacity-50`}>{m.statLabel}</p>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
            style={{ backgroundColor: m.textColor === "text-white" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
          >
            <i className={`ri-add-line text-base ${m.textColor}`}></i>
          </div>
        </div>
      </div>

      <div className="overflow-hidden transition-all duration-500" style={{ maxHeight: open ? "500px" : "0px" }}>
        <div className="flex flex-col md:flex-row gap-0">
          <div className="flex-1 px-7 pb-8">
            <p className={`text-sm md:text-base font-semibold italic mb-3 ${m.textColor} opacity-60`}>
              &ldquo;{m.tagline}&rdquo;
            </p>
            <p className={`text-sm md:text-base leading-relaxed ${m.textColor} opacity-80`}>
              {m.description}
            </p>
          </div>
          <div className="md:w-64 flex-shrink-0">
            <img src={m.image} alt={m.title} className="w-full h-48 md:h-full object-cover object-top" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowWeWork() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
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
      <section
        className="relative pt-40 pb-28 px-6 md:px-16 overflow-hidden"
        style={{ backgroundColor: "#7C3AED" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-20" style={{ backgroundColor: "#A78BFA", filter: "blur(100px)" }} />
          <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full opacity-10" style={{ backgroundColor: "#DDD6FE", filter: "blur(80px)" }} />
        </div>

        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 text-[280px] font-black leading-none select-none pointer-events-none hidden lg:block"
          style={{ color: "rgba(255,255,255,0.04)" }}
        >
          7
        </div>

        <div ref={heroRef} className="relative max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-6 text-white/50">
            Metodología
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-20">
            <div className="flex-1">
              <h1 className="text-6xl md:text-8xl lg:text-[100px] font-black text-white leading-none mb-0">
                Preguntar<br />
                <span style={{ color: "#A78BFA" }}>transforma.</span>
              </h1>
            </div>
            <div className="lg:max-w-sm pb-2">
              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8">
                Nuestra metodología está construida sobre décadas de investigación en coaching ejecutivo, psicología positiva y neurociencia. No improvisamos — cada conversación tiene un propósito claro.
              </p>
              <Link
                to="/what-we-do"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap text-black"
                style={{ backgroundColor: "#EDE9FE" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#DDD6FE")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#EDE9FE")}
              >
                Ver la plataforma
                <i className="ri-arrow-right-line"></i>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-14">
            {[
              { val: "7", label: "Pilares metodológicos" },
              { val: "4+", label: "Técnicas de coaching" },
              { val: "360°", label: "Visión del bienestar" },
              { val: "100%", label: "Privacidad garantizada" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-5 py-3 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <span className="text-xl font-black text-white">{s.val}</span>
                <span className="text-xs text-white/50 uppercase tracking-wide">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="px-6 md:px-16 py-20" style={{ backgroundColor: "#F9F6FF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
              Nuestros principios
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
              Los valores que guían<br />cada conversación.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {principles.map((p, i) => (
              <div
                key={p.title}
                className="rounded-2xl p-7 flex flex-col gap-4"
                style={{ backgroundColor: p.color, animation: `fadeUp 0.6s ease ${i * 0.1}s both` }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: p.color === "#7C3AED" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
                >
                  <i className={`${p.icon} text-xl ${p.color === "#7C3AED" ? "text-white" : "text-black"}`}></i>
                </div>
                <h3 className={`text-lg font-bold leading-tight ${p.color === "#7C3AED" ? "text-white" : "text-black"}`}>
                  {p.title}
                </h3>
                <p className={`text-sm leading-relaxed ${p.color === "#7C3AED" ? "text-white/70" : "text-black/60"}`}>
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-6 md:px-16 pb-24" style={{ backgroundColor: "#F9F6FF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
              Los 7 pilares
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
              Así funciona Cogniflow,<br />paso a paso.
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {pillars.map((m, i) => (
              <PillarCard key={m.id} m={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Dark */}
      <section className="px-6 md:px-16 py-24" style={{ backgroundColor: "#1A0A2E" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-white/30">
            El proceso
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-white leading-none mb-16">
            Escucha.<br />
            <span style={{ color: "#A78BFA" }}>Reflexiona.</span><br />
            Decide.<br />
            <span style={{ color: "#DDD6FE" }}>Crece.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n: "01", step: "Escucha", body: "Cogniflow te hace preguntas poderosas. Sin juicio, sin prisa. Un espacio seguro para explorar lo que realmente piensas y sientes.", accent: "#A78BFA" },
              { n: "02", step: "Reflexiona", body: "A través del diálogo, identificas tus propios patrones, bloqueos y áreas de oportunidad. La IA actúa como espejo, no como juez.", accent: "#A78BFA" },
              { n: "03", step: "Decide", body: "Defines objetivos claros y un plan de acción concreto. Cogniflow te acompaña en construir compromisos reales contigo mismo.", accent: "#DDD6FE" },
              { n: "04", step: "Crece", body: "El sistema te acompaña día a día: notificaciones, check-ins, datos fisiológicos y la presencia de tu coach humana cuando más la necesitas.", accent: "#DDD6FE" },
            ].map((p) => (
              <div key={p.n} className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-black flex-shrink-0"
                    style={{ backgroundColor: p.accent }}
                  >
                    {p.n}
                  </span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
                <h3 className="text-2xl font-black text-white">{p.step}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{p.body}</p>
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
              La metodología es sólida.<br />
              <span style={{ color: "#7C3AED" }}>El impacto es real.</span>
            </h2>
            <p className="text-base text-gray-500 max-w-md">
              Agenda una demo y ve cómo Cogniflow puede transformar el desarrollo de talento en tu organización.
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/lets-talk"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: "#7C3AED" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#6D28D9")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#7C3AED")}
            >
              Solicitar demo
              <i className="ri-arrow-right-line text-base"></i>
            </Link>
            <Link
              to="/what-we-do"
              className="inline-flex items-center justify-center gap-2 text-black font-semibold px-8 py-4 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap border border-black/20 hover:border-black/40"
            >
              La plataforma
              <i className="ri-arrow-right-line text-base"></i>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}