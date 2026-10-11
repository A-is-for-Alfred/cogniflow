import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmpresaHeader from "./components/EmpresaHeader";
import GlobalIndicators from "./components/GlobalIndicators";
import EmployeeTable from "./components/EmployeeTable";
import EmployeeReportModal from "./components/EmployeeReportModal";

export interface Employee {
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
  status: "Activo" | "En riesgo" | "Excelente";
  trend: "up" | "down" | "stable";
  reportSummary: string;
}

const employees: Employee[] = [
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
    status: "Excelente",
    trend: "up",
    reportSummary: "Ana muestra un alto nivel de compromiso y energía esta semana. Sus conversaciones reflejan satisfacción con sus proyectos actuales y claridad sobre sus objetivos. Se recomienda mantener el ritmo y reconocer sus logros públicamente.",
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
    status: "En riesgo",
    trend: "down",
    reportSummary: "Carlos menciona reiteradamente carga de trabajo excesiva y falta de apoyo del equipo. Su índice de burnout ha subido 12 puntos en las últimas 2 semanas. Se recomienda intervención del coach para una sesión personalizada urgente.",
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
    status: "Activo",
    trend: "stable",
    reportSummary: "Sofía mantiene un equilibrio saludable entre su vida personal y laboral. Expresa interés en asumir más responsabilidades de liderazgo. Se sugiere hablar con su supervisor sobre oportunidades de crecimiento.",
  },
  {
    id: 4,
    name: "Miguel Torres",
    role: "Ingeniero Senior",
    department: "Tecnología",
    avatar: "https://readdy.ai/api/search-image?query=professional%20latino%20man%20engineer%20thoughtful%20glasses%20casual%20shirt%20office%20headshot%20portrait&width=80&height=80&seq=emp4&orientation=squarish",
    happiness: 69,
    productivity: 78,
    burnout: 41,
    stress: 48,
    engagement: 71,
    lastSession: "Hace 1 día",
    status: "Activo",
    trend: "up",
    reportSummary: "Miguel ha mejorado notablemente desde las sesiones de la semana pasada. Está trabajando activamente en sus hábitos de descanso. Sus niveles de estrés han bajado 8 puntos. Seguimiento recomendado en 5 días.",
  },
  {
    id: 5,
    name: "Lucía Vega",
    role: "Coordinadora de RRHH",
    department: "Talento",
    avatar: "https://readdy.ai/api/search-image?query=professional%20latina%20woman%20HR%20coordinator%20warm%20friendly%20smile%20office%20headshot%20portrait&width=80&height=80&seq=emp5&orientation=squarish",
    happiness: 88,
    productivity: 87,
    burnout: 19,
    stress: 24,
    engagement: 93,
    lastSession: "Hoy",
    status: "Excelente",
    trend: "up",
    reportSummary: "Lucía es uno de los perfiles más saludables del equipo. Alta satisfacción laboral, fuerte sentido de propósito y excelente resiliencia. Puede ser mentora para otros colaboradores del área.",
  },
  {
    id: 6,
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
    status: "En riesgo",
    trend: "down",
    reportSummary: "Roberto presenta señales claras de agotamiento ejecutivo. Sus sesiones revelan preocupación por presión de resultados y sensación de soledad en la toma de decisiones. Se recomienda sesión presencial con la coach principal esta semana.",
  },
];

export default function EmpresaPanel() {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <EmpresaHeader onBack={() => navigate("/demo")} />
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-10">
        <GlobalIndicators employees={employees} />
        <EmployeeTable
          employees={employees}
          onSelectEmployee={setSelectedEmployee}
        />
      </main>
      {selectedEmployee && (
        <EmployeeReportModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}