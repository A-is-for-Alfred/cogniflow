import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase, getSafeSession } from "@/lib/supabase";

type Role = "empresa" | "coach" | "empleado";
type AuthMode = "login" | "register";

interface RoleConfig {
  key: Role;
  label: string;
  icon: string;
  badge: string;
  accent: string;
  accentLight: string;
  description: string;
  path: string;
}

const roles: RoleConfig[] = [
  {
    key: "empresa",
    label: "Panel de Empresa",
    icon: "ri-building-2-line",
    badge: "Dirección & RRHH",
    accent: "#7C3AED",
    accentLight: "#EDE9FE",
    description: "Accede a métricas globales y reportes de tu organización.",
    path: "/demo/empresa",
  },
  {
    key: "coach",
    label: "Panel de Coach",
    icon: "ri-user-star-line",
    badge: "Coach profesional",
    accent: "#059669",
    accentLight: "#ECFDF5",
    description: "Gestiona colaboradores, objetivos y sesiones personales.",
    path: "/demo/coach",
  },
  {
    key: "empleado",
    label: "Mi Espacio",
    icon: "ri-user-smile-line",
    badge: "Colaborador",
    accent: "#D97706",
    accentLight: "#FFFBEB",
    description: "Conversa con tu compañero IA, revisa metas y tu progreso.",
    path: "/demo/empleado",
  },
];

const COMPANY_SIZES = [
  "1–10 personas",
  "11–50 personas",
  "51–200 personas",
  "201–500 personas",
  "501–1,000 personas",
  "Más de 1,000 personas",
];

const SECTORS = [
  "Tecnología",
  "Salud",
  "Educación",
  "Finanzas",
  "Manufactura",
  "Retail",
  "Servicios profesionales",
  "Construcción",
  "Logística & Transporte",
  "Medios & Comunicación",
  "Energía",
  "Gobierno",
  "Otro",
];

interface EmpresaForm {
  adminName: string;
  email: string;
  password: string;
  companyName: string;
  description: string;
  website: string;
  sector: string;
  size: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  mainActivities: string;
}

const emptyEmpresaForm: EmpresaForm = {
  adminName: "",
  email: "",
  password: "",
  companyName: "",
  description: "",
  website: "",
  sector: "",
  size: "",
  country: "",
  contactEmail: "",
  contactPhone: "",
  mainActivities: "",
};

export default function DemoAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get("role") as Role) || "empleado";

  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generic auth fields (login + coach/empleado register)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [position, setPosition] = useState("");
  const [specialty, setSpecialty] = useState("");

  // Empresa register form (all company fields)
  const [empresaForm, setEmpresaForm] = useState<EmpresaForm>(emptyEmpresaForm);

  const activeRole = roles.find((r) => r.key === selectedRole)!;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setCompanyCode("");
    setPosition("");
    setSpecialty("");
    setEmpresaForm(emptyEmpresaForm);
    setError(null);
    setSuccess(null);
  };

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setMode("login");
    resetForm();
  };

  const handleModeChange = (m: AuthMode) => {
    setMode(m);
    resetForm();
  };

  const setEmpField = (field: keyof EmpresaForm, value: string) => {
    setEmpresaForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        const session = await getSafeSession();
        const userId = session?.user.id;

        if (selectedRole === "coach") {
          const { data: coach } = await supabase
            .from("coaches")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
          if (!coach) throw new Error("No se encontró un perfil de coach para este correo.");
        } else if (selectedRole === "empleado") {
          const { data: emp } = await supabase
            .from("employees")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
          if (!emp) throw new Error("No se encontró un perfil de empleado para este correo.");
        }

        navigate(activeRole.path);
      } else {
        // ── REGISTER ──────────────────────────────────────────────
        if (selectedRole === "empresa") {
          if (!empresaForm.companyName.trim()) throw new Error("El nombre de la empresa es obligatorio.");
          if (!empresaForm.email.trim()) throw new Error("El correo es obligatorio.");
          if (empresaForm.password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");

          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: empresaForm.email,
            password: empresaForm.password,
          });
          if (signUpError) throw signUpError;

          const userId = signUpData.user?.id;
          if (!userId) throw new Error("No se pudo crear la cuenta. Intenta de nuevo.");

          // Insert company
          const { error: companyError } = await supabase.from("companies").insert({
            name: empresaForm.companyName.trim(),
            description: empresaForm.description.trim() || null,
            website: empresaForm.website.trim() || null,
            sector: empresaForm.sector || null,
            size: empresaForm.size || null,
            country: empresaForm.country.trim() || null,
            contact_email: empresaForm.contactEmail.trim() || empresaForm.email,
            contact_phone: empresaForm.contactPhone.trim() || null,
            main_activities: empresaForm.mainActivities.trim() || null,
          });
          if (companyError) throw companyError;

          setSuccess("Empresa registrada. Revisa tu correo para confirmar tu cuenta y luego inicia sesión.");
          setMode("login");
          setEmail(empresaForm.email);
          setEmpresaForm(emptyEmpresaForm);
        } else {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          if (signUpError) throw signUpError;

          const userId = signUpData.user?.id;
          if (!userId) throw new Error("No se pudo crear la cuenta. Intenta de nuevo.");

          if (selectedRole === "coach") {
            const { error: profileError } = await supabase
              .from("coaches")
              .insert({ user_id: userId, name, email, specialty });
            if (profileError) throw profileError;
          } else if (selectedRole === "empleado") {
            let companyId: number | null = null;
            if (companyCode.trim()) {
              const { data: company } = await supabase
                .from("companies")
                .select("id")
                .ilike("name", `%${companyCode.trim()}%`)
                .maybeSingle();
              companyId = company?.id ?? null;
            }

            if (!companyId) {
              const { data: newCompany, error: companyError } = await supabase
                .from("companies")
                .insert({ name: companyCode.trim() || "Mi Empresa" })
                .select("id")
                .single();
              if (companyError) throw companyError;
              companyId = newCompany.id;
            }

            const { error: profileError } = await supabase.from("employees").insert({
              user_id: userId,
              company_id: companyId,
              name,
              email,
              position,
            });
            if (profileError) throw profileError;
          }

          setSuccess("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.");
          setMode("login");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Helper: input style
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-white";

  const fieldLabel = (label: string, required = false) => (
    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F9F6FF" }}>
      {/* BG blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full opacity-35"
          style={{ backgroundColor: "#DDD6FE", filter: "blur(100px)" }}
        />
        <div
          className="absolute bottom-[0%] left-[-6%] w-[380px] h-[380px] rounded-full opacity-20"
          style={{ backgroundColor: "#C4B5FD", filter: "blur(90px)" }}
        />
      </div>

      {/* Mini nav */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-16 py-5">
        <button
          onClick={() => navigate("/demo")}
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
        <button
          onClick={() => navigate("/demo")}
          className="text-xs text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
        >
          <i className="ri-arrow-left-line"></i>
          Volver al inicio
        </button>
      </header>

      <main
        className="relative z-10 flex-1 flex flex-col lg:flex-row items-start justify-center px-6 py-10 gap-12 max-w-6xl mx-auto w-full"
      >
        {/* Left: Role selector */}
        <div className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            ¿Cuál es tu rol?
          </p>
          <div className="flex flex-col gap-3">
            {roles.map((role) => {
              const active = selectedRole === role.key;
              return (
                <button
                  key={role.key}
                  onClick={() => handleRoleChange(role.key)}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer border"
                  style={{
                    backgroundColor: active ? role.accentLight : "#fff",
                    borderColor: active ? role.accent : "transparent",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{
                      backgroundColor: active ? role.accent : "#F3F4F6",
                      color: active ? "#fff" : "#6B7280",
                    }}
                  >
                    <i className={role.icon}></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: active ? role.accent : "#111827" }}>
                      {role.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>
                  </div>
                  {active && (
                    <i className="ri-check-line ml-auto text-base" style={{ color: role.accent }}></i>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Auth form */}
        <div className="w-full flex-1 max-w-xl">
          <div
            className="bg-white rounded-3xl p-8 border border-gray-100"
            style={{ boxShadow: "0 4px 40px rgba(124,58,237,0.07)" }}
          >
            {/* Role badge */}
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: activeRole.accentLight, color: activeRole.accent }}
            >
              <i className={activeRole.icon}></i>
              {activeRole.badge}
            </span>

            {/* Mode toggle */}
            <div className="flex p-1 rounded-xl mb-6" style={{ backgroundColor: "#F3F4F6" }}>
              {(["login", "register"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: mode === m ? "#fff" : "transparent",
                    color: mode === m ? activeRole.accent : "#9CA3AF",
                    boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {m === "login" ? "Iniciar sesión" : "Registrarse"}
                </button>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-black mb-1">
              {mode === "login" ? "Bienvenido de vuelta" : selectedRole === "empresa" ? "Registra tu empresa" : "Crea tu cuenta"}
            </h1>
            <p className="text-sm text-gray-400 mb-7">
              {mode === "login"
                ? `Accede a tu ${activeRole.label.toLowerCase()}.`
                : selectedRole === "empresa"
                ? "Completa los datos de tu organización para comenzar con Cogniflow."
                : `Únete a Cogniflow como ${activeRole.badge.toLowerCase()}.`}
            </p>

            {/* Alerts */}
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2">
                <i className="ri-error-warning-line mt-0.5 flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 flex items-start gap-2">
                <i className="ri-check-line mt-0.5 flex-shrink-0"></i>
                <span>{success}</span>
              </div>
            )}

            {/* ── LOGIN FORM (all roles) ── */}
            {mode === "login" && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  {fieldLabel("Correo electrónico", true)}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@correo.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  {fieldLabel("Contraseña", true)}
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer whitespace-nowrap mt-2 disabled:opacity-60"
                  style={{ backgroundColor: activeRole.accent }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      Ingresando...
                    </span>
                  ) : (
                    "Ingresar al panel"
                  )}
                </button>
              </form>
            )}

            {/* ── REGISTER: EMPRESA ── */}
            {mode === "register" && selectedRole === "empresa" && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Section: Cuenta */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <i className="ri-lock-line"></i> Datos de acceso
                  </p>
                  <div className="flex flex-col gap-4">
                    <div>
                      {fieldLabel("Correo del administrador", true)}
                      <input
                        type="email"
                        value={empresaForm.email}
                        onChange={(e) => setEmpField("email", e.target.value)}
                        required
                        placeholder="admin@empresa.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      {fieldLabel("Contraseña", true)}
                      <input
                        type="password"
                        value={empresaForm.password}
                        onChange={(e) => setEmpField("password", e.target.value)}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Empresa */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <i className="ri-building-2-line"></i> Información de la empresa
                  </p>
                  <div className="flex flex-col gap-4">
                    <div>
                      {fieldLabel("Nombre de la empresa", true)}
                      <input
                        type="text"
                        value={empresaForm.companyName}
                        onChange={(e) => setEmpField("companyName", e.target.value)}
                        required
                        placeholder="Ej. Innovatech S.A. de C.V."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      {fieldLabel("Descripción")}
                      <textarea
                        value={empresaForm.description}
                        onChange={(e) => setEmpField("description", e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="¿A qué se dedica la empresa? Resumen breve..."
                        className={`${inputClass} resize-none`}
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {empresaForm.description.length}/500
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        {fieldLabel("Sector")}
                        <select
                          value={empresaForm.sector}
                          onChange={(e) => setEmpField("sector", e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value="">Seleccionar...</option>
                          {SECTORS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        {fieldLabel("Tamaño de la empresa")}
                        <select
                          value={empresaForm.size}
                          onChange={(e) => setEmpField("size", e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value="">Seleccionar...</option>
                          {COMPANY_SIZES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      {fieldLabel("País")}
                      <input
                        type="text"
                        value={empresaForm.country}
                        onChange={(e) => setEmpField("country", e.target.value)}
                        placeholder="Ej. México"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      {fieldLabel("Sitio web")}
                      <input
                        type="url"
                        value={empresaForm.website}
                        onChange={(e) => setEmpField("website", e.target.value)}
                        placeholder="https://www.tuempresa.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      {fieldLabel("Actividades principales")}
                      <textarea
                        value={empresaForm.mainActivities}
                        onChange={(e) => setEmpField("mainActivities", e.target.value)}
                        rows={2}
                        maxLength={500}
                        placeholder="Ej. Desarrollo de software, consultoría IT, soporte técnico..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Contacto */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <i className="ri-phone-line"></i> Contacto de la empresa
                  </p>
                  <div className="flex flex-col gap-4">
                    <div>
                      {fieldLabel("Correo de contacto")}
                      <input
                        type="email"
                        value={empresaForm.contactEmail}
                        onChange={(e) => setEmpField("contactEmail", e.target.value)}
                        placeholder="contacto@empresa.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      {fieldLabel("Teléfono de contacto")}
                      <input
                        type="tel"
                        value={empresaForm.contactPhone}
                        onChange={(e) => setEmpField("contactPhone", e.target.value)}
                        placeholder="+52 55 1234 5678"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer whitespace-nowrap mt-1 disabled:opacity-60"
                  style={{ backgroundColor: activeRole.accent }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      Registrando empresa...
                    </span>
                  ) : (
                    "Registrar empresa"
                  )}
                </button>
              </form>
            )}

            {/* ── REGISTER: COACH ── */}
            {mode === "register" && selectedRole === "coach" && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  {fieldLabel("Nombre completo", true)}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Tu nombre"
                    className={inputClass}
                  />
                </div>
                <div>
                  {fieldLabel("Correo electrónico", true)}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@correo.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  {fieldLabel("Contraseña", true)}
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className={inputClass}
                  />
                </div>
                <div>
                  {fieldLabel("Especialidad")}
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ej. Liderazgo y bienestar organizacional"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer whitespace-nowrap mt-2 disabled:opacity-60"
                  style={{ backgroundColor: activeRole.accent }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      Creando cuenta...
                    </span>
                  ) : (
                    "Crear mi cuenta"
                  )}
                </button>
              </form>
            )}

            {/* ── REGISTER: EMPLEADO ── */}
            {mode === "register" && selectedRole === "empleado" && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  {fieldLabel("Nombre completo", true)}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Tu nombre"
                    className={inputClass}
                  />
                </div>
                <div>
                  {fieldLabel("Correo electrónico", true)}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@correo.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  {fieldLabel("Contraseña", true)}
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className={inputClass}
                  />
                </div>
                <div>
                  {fieldLabel("Nombre de tu empresa")}
                  <input
                    type="text"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    placeholder="Ej. Innovatech S.A."
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Si tu empresa ya existe en Cogniflow, serás vinculado automáticamente.
                  </p>
                </div>
                <div>
                  {fieldLabel("Puesto / Cargo")}
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Ej. Gerente de Operaciones"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer whitespace-nowrap mt-2 disabled:opacity-60"
                  style={{ backgroundColor: activeRole.accent }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      Creando cuenta...
                    </span>
                  ) : (
                    "Crear mi cuenta"
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Al continuar aceptas los términos de uso de Cogniflow.{" "}
            <span className="text-gray-300">•</span> Demo interactiva
          </p>
        </div>
      </main>
    </div>
  );
}