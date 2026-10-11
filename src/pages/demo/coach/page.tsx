import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CoachHeader from "./components/CoachHeader";
import CoachEmployeeList from "./components/CoachEmployeeList";
import CoachDetailPanel from "./components/CoachDetailPanel";

export interface CoachEmployee {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar: string;
  happiness: number;
  productivity: number;
  burnout: number;
  stress: number;
  engagement: number;
  lastSession: string;
  nextSession: string | null;
  status: "Activo" | "En riesgo" | "Excelente";
  goals: { id: number; text: string; done: boolean; dueDate: string }[];
  reportDetail: string;
  weeklyInsight: string;
  sessionNotes: string;
}

const coachEmployees: CoachEmployee[] = [
  {
    id: 1,
    name: "Ana Martínez",
    role: "Gerente de Proyectos",
    department: "Operaciones",
    avatar: "https://readdy.ai/api/search-image?query=professional%20latina%20woman%20manager%20confident%20smile%20warm%20office%20background%20headshot%20portrait&width=80&height=80&seq=emp1&orientation=squarish",
    happiness: 84,
    productivity: 91,
    burnout: 22,
    stress: 31,
    engagement: 88,
    lastSession: "Hace 1 día",
    nextSession: "Viernes 23 mayo, 10:00 am",
    status: "Excelente",
    goals: [
      { id: 1, text: "Hacer pausa activa de 10 min a mediodía", done: true, dueDate: "Diario" },
      { id: 2, text: "Leer 20 min antes de dormir", done: true, dueDate: "Diario" },
      { id: 3, text: "Delegar al menos 2 tareas por semana", done: false, dueDate: "Semanal" },
      { id: 4, text: "Reunión 1:1 con cada miembro de su equipo", done: false, dueDate: "Esta semana" },
    ],
    reportDetail: "Ana presenta un perfil de alto desempeño con excelente balance emocional. Esta semana expresó sentirse reconocida por su equipo y muy motivada con el nuevo proyecto asignado. Su score de resiliencia subió 7 puntos. Patrón de sueño estable según datos del wearable (7.2 hrs promedio). Frecuencia cardíaca en reposo: 62 bpm (óptima). Sugiero reforzar la habilidad de delegar como área de oportunidad.",
    weeklyInsight: "Ana ha completado el 75% de sus objetivos semanales. Su mayor fortaleza esta semana: comunicación asertiva con su equipo.",
    sessionNotes: "Explorar con Ana su relación con la perfección y cómo le afecta al momento de delegar tareas.",
  },
  {
    id: 2,
    name: "Carlos Rivas",
    role: "Director Comercial",
    department: "Ventas",
    avatar: "https://readdy.ai/api/search-image?query=professional%20latino%20man%20director%20serious%20confident%20dark%20suit%20office%20headshot%20portrait&width=80&height=80&seq=emp2&orientation=squarish",
    happiness: 61,
    productivity: 73,
    burnout: 54,
    stress: 67,
    engagement: 65,
    lastSession: "Hace 3 días",
    nextSession: null,
    status: "En riesgo",
    goals: [
      { id: 1, text: "Desconectarse del trabajo a las 7pm", done: false, dueDate: "Diario" },
      { id: 2, text: "30 min de actividad física", done: false, dueDate: "Diario" },
      { id: 3, text: "Hablar con su equipo sobre redistribución de carga", done: false, dueDate: "Esta semana" },
    ],
    reportDetail: "Carlos muestra señales claras de agotamiento ejecutivo progresivo. Datos del wearable: promedio de sueño 5.4 hrs, frecuencia cardíaca en reposo elevada (78 bpm). En sus últimas sesiones ha mencionado 'ya no sé para qué' repetidamente. Hay un patrón de pensamiento dicotómico que debemos trabajar. Su cortisol subjetivo auto-reportado está en el percentil 85 de la muestra. URGENTE: sesión presencial esta semana.",
    weeklyInsight: "Carlos no completó ninguno de sus objetivos esta semana. Requiere intervención directa de la coach.",
    sessionNotes: "Prioridad: reducir la carga percibida. Aplicar técnica de ventana de tolerancia. Validar emociones primero, no ir directo a soluciones.",
  },
  {
    id: 3,
    name: "Sofía Herrera",
    role: "Líder de Diseño",
    department: "Producto",
    avatar: "https://readdy.ai/api/search-image?query=young%20professional%20latina%20woman%20creative%20designer%20casual%20modern%20office%20background%20headshot%20portrait&width=80&height=80&seq=emp3&orientation=squarish",
    happiness: 77,
    productivity: 85,
    burnout: 28,
    stress: 34,
    engagement: 82,
    lastSession: "Hace 2 días",
    nextSession: "Lunes 26 mayo, 9:00 am",
    status: "Activo",
    goals: [
      { id: 1, text: "Meditar 10 min al despertar", done: true, dueDate: "Diario" },
      { id: 2, text: "Documentar un aprendizaje semanal", done: true, dueDate: "Semanal" },
      { id: 3, text: "Hablar con su jefe sobre crecimiento de carrera", done: false, dueDate: "Este mes" },
    ],
    reportDetail: "Sofía se encuentra en un estado de flujo creativo positivo. Reporta alta satisfacción con su trabajo actual. El análisis lingüístico de sus conversaciones muestra un lenguaje altamente orientado al futuro y a la acción. Área de oportunidad: asertividad para pedir lo que necesita. Sus datos fisiológicos son excelentes.",
    weeklyInsight: "Sofía completó el 66% de sus objetivos. Está lista para asumir un objetivo de mayor impacto.",
    sessionNotes: "Explorar sus aspiraciones de liderazgo. Usar la técnica de 'el mejor yo posible' como ejercicio de visualización.",
  },
  {
    id: 4,
    name: "Roberto Salinas",
    role: "CFO",
    department: "Finanzas",
    avatar: "https://readdy.ai/api/search-image?query=professional%20older%20latino%20man%20CFO%20formal%20suit%20confident%20office%20executive%20headshot%20portrait&width=80&height=80&seq=emp6&orientation=squarish",
    happiness: 58,
    productivity: 68,
    burnout: 62,
    stress: 71,
    engagement: 55,
    lastSession: "Hace 5 días",
    nextSession: null,
    status: "En riesgo",
    goals: [
      { id: 1, text: "No revisar el email después de las 8pm", done: false, dueDate: "Diario" },
      { id: 2, text: "Tomar descanso real el fin de semana", done: false, dueDate: "Semanal" },
    ],
    reportDetail: "Roberto es un perfil de alto riesgo de burnout ejecutivo. Lleva 6 semanas con patrones de sueño alterados (4.8 hrs promedio). El análisis de sus conversaciones revela aislamiento emocional, pensamiento catastrófico y alta autocrítica. Recomienda seguimiento psicológico combinado con coaching. Es fundamental agenda presencial urgente.",
    weeklyInsight: "Roberto no ha tenido sesión en 5 días. Hay que retomar el contacto activamente.",
    sessionNotes: "No comenzar con productividad. Empezar preguntando cómo se siente desde un lugar genuinamente humano. El rapport es el paso 1.",
  },
];

export default function CoachPanel() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CoachEmployee>(coachEmployees[0]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CoachHeader onBack={() => navigate("/demo")} />
      <div className="flex flex-1 overflow-hidden max-w-full">
        <CoachEmployeeList
          employees={coachEmployees}
          selectedId={selected.id}
          onSelect={setSelected}
        />
        <CoachDetailPanel employee={selected} />
      </div>
    </div>
  );
}