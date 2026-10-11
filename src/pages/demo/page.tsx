import { useNavigate } from "react-router-dom";

const panels = [
  {
    key: "empresa",
    icon: "ri-building-2-line",
    label: "Panel de Empresa",
    description:
      "Accede a indicadores globales de bienestar, productividad y agotamiento de toda la organización. Monitorea el estado de cada empleado y lee sus reportes agregados.",
    tags: ["Métricas globales", "Reportes por empleado", "Índices de bienestar"],
    accent: "#7C3AED",
    accentLight: "#EDE9FE",
    badge: "Dirección & RRHH",
    path: "/demo/auth/empresa",
  },
  {
    key: "coach",
    icon: "ri-user-star-line",
    label: "Panel de Coach",
    description:
      "Vista completa de cada colaborador: reportes detallados, edición de objetivos personalizados, agenda de sesiones 1:1 y herramientas de seguimiento avanzado.",
    tags: ["Reportes profundos", "Gestión de metas", "Agendar sesiones"],
    accent: "#059669",
    accentLight: "#ECFDF5",
    badge: "Coach profesional",
    path: "/demo/auth/coach",
  },
  {
    key: "empleado",
    icon: "ri-user-smile-line",
    label: "Mi Espacio",
    description:
      "Tu compañero diario: conversa con la IA, registra cómo te sientes hoy, revisa tus metas y observa tu progreso a lo largo del tiempo.",
    tags: ["Chat empático", "Mis metas", "Constancia diaria"],
    accent: "#D97706",
    accentLight: "#FFFBEB",
    badge: "Colaborador",
    path: "/demo/auth/empleado",
  },
];

export default function DemoPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F9F6FF" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-40"
          style={{ backgroundColor: "#DDD6FE", filter: "blur(100px)" }}
        />
        <div
          className="absolute bottom-[0%] left-[-6%] w-[400px] h-[400px] rounded-full opacity-25"
          style={{ backgroundColor: "#C4B5FD", filter: "blur(90px)" }}
        />
      </div>

      {/* Mini nav */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-16 py-5">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-bold text-base text-black cursor-pointer"
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#A78BFA" }}
          >
            <i className="ri-brain-line text-white text-sm"></i>
          </span>
          Cogniflow
        </button>
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}
        >
          Demo interactiva
        </span>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
            style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}
          >
            <i className="ri-sparkling-line"></i>
            Bienvenido a la experiencia Cogniflow
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            ¿Desde qué perspectiva
            <br />
            <span style={{ color: "#7C3AED" }}>quieres explorar?</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Cogniflow tiene un panel adaptado para cada rol. Elige el que mejor
            represente tu posición en la organización y explora la experiencia.
          </p>
        </div>

        {/* Panel cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
          {panels.map((panel) => (
            <button
              key={panel.key}
              onClick={() => navigate(panel.path)}
              className="group relative flex flex-col text-left rounded-3xl p-8 transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200 bg-white"
              style={{
                boxShadow: "0 2px 24px rgba(91,46,230,0.07)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-6px)";
                (
                  e.currentTarget as HTMLElement
                ).style.boxShadow = `0 16px 48px ${panel.accent}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 2px 24px rgba(91,46,230,0.07)";
              }}
            >
              {/* Badge */}
              <span
                className="self-start text-xs font-semibold px-3 py-1 rounded-full mb-6"
                style={{
                  backgroundColor: panel.accentLight,
                  color: panel.accent,
                }}
              >
                {panel.badge}
              </span>

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl"
                style={{ backgroundColor: panel.accentLight, color: panel.accent }}
              >
                <i className={panel.icon}></i>
              </div>

              <h2 className="text-xl font-bold text-black mb-3">{panel.label}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
                {panel.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {panel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: panel.accentLight,
                      color: panel.accent,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA arrow */}
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: panel.accent }}>
                Explorar panel
                <i
                  className="ri-arrow-right-line transition-transform duration-200 group-hover:translate-x-1"
                ></i>
              </div>
            </button>
          ))}
        </div>

        {/* Prototype B link */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-400">
            ¿Quieres probar el nuevo flujo?
          </p>
          <button
            onClick={() => {
              sessionStorage.setItem("empleado_redirect", "/demo/empleado-v2");
              navigate("/demo/auth/empleado");
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap"
            style={{
              borderColor: "#8f0f48",
              color: "#8f0f48",
              background: "none",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3e8ee"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
          >
            <i className="ri-route-line"></i>
            Demo Prototipo B — Experiencia del líder
          </button>
          <button
            onClick={() => navigate("/demo/surveys")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap"
            style={{
              borderColor: "#7C3AED",
              color: "#7C3AED",
              background: "none",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE9FE"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
          >
            <i className="ri-survey-line"></i>
            Ver encuestas de sesión
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Todo el contenido en esta demo es ficticio. Representa la experiencia real de la plataforma Cogniflow.
        </p>
      </main>
    </div>
  );
}