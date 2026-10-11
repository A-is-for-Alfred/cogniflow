import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "register";

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

const emptyForm: EmpresaForm = {
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

const accent = "#7C3AED";
const accentLight = "#EDE9FE";

export default function EmpresaAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EmpresaForm>(emptyForm);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const setField = (field: keyof EmpresaForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (signInError) throw signInError;
      navigate("/demo/empresa");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim()) { setError("El nombre de la empresa es obligatorio."); return; }
    if (form.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: undefined },
      });
      if (signUpError) throw signUpError;
      const userId = signUpData.user?.id;
      if (!userId) throw new Error("No se pudo crear la cuenta. Intenta de nuevo.");

      const { error: companyError } = await supabase.from("companies").insert({
        name: form.companyName.trim(),
        description: form.description.trim() || null,
        website: form.website.trim() || null,
        sector: form.sector || null,
        size: form.size || null,
        country: form.country.trim() || null,
        contact_email: form.contactEmail.trim() || form.email,
        contact_phone: form.contactPhone.trim() || null,
        main_activities: form.mainActivities.trim() || null,
      });
      if (companyError) throw companyError;

      // Auto sign in after register (no email confirm)
      navigate("/demo/empresa");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-white";

  const fieldLabel = (label: string, required = false) => (
    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F9F6FF" }}>
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full opacity-35" style={{ backgroundColor: "#DDD6FE", filter: "blur(100px)" }} />
        <div className="absolute bottom-[0%] left-[-6%] w-[380px] h-[380px] rounded-full opacity-20" style={{ backgroundColor: "#C4B5FD", filter: "blur(90px)" }} />
      </div>

      {/* Mini nav */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-16 py-5">
        <button onClick={() => navigate("/demo")} className="flex items-center gap-2 font-bold text-base text-black cursor-pointer">
          <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#A78BFA" }}>
            <i className="ri-brain-line text-white text-sm"></i>
          </span>
          Cogniflow
        </button>
        <button onClick={() => navigate("/demo")} className="text-xs text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors">
          <i className="ri-arrow-left-line"></i>
          Volver
        </button>
      </header>

      <main className="relative z-10 flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-xl">
          {/* Role badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: accentLight, color: accent }}>
              <i className="ri-building-2-line"></i>
            </div>
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: accentLight, color: accent }}>
                Dirección & RRHH
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100" style={{ boxShadow: "0 4px 40px rgba(124,58,237,0.07)" }}>
            {/* Mode toggle */}
            <div className="flex p-1 rounded-xl mb-6" style={{ backgroundColor: "#F3F4F6" }}>
              {(["login", "register"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: mode === m ? "#fff" : "transparent",
                    color: mode === m ? accent : "#9CA3AF",
                    boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {m === "login" ? "Iniciar sesión" : "Registrar empresa"}
                </button>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-black mb-1">
              {mode === "login" ? "Bienvenido de vuelta" : "Registra tu empresa"}
            </h1>
            <p className="text-sm text-gray-400 mb-7">
              {mode === "login"
                ? "Accede al panel de métricas de tu organización."
                : "Completa los datos de tu organización para comenzar con Cogniflow."}
            </p>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2">
                <i className="ri-error-warning-line mt-0.5 flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            {/* LOGIN */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  {fieldLabel("Correo del administrador", true)}
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="admin@empresa.com" className={inputClass} />
                </div>
                <div>
                  {fieldLabel("Contraseña", true)}
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className={inputClass} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer whitespace-nowrap mt-2 disabled:opacity-60" style={{ backgroundColor: accent }}>
                  {loading ? <span className="flex items-center justify-center gap-2"><i className="ri-loader-4-line animate-spin"></i>Ingresando...</span> : "Ingresar al panel"}
                </button>
              </form>
            )}

            {/* REGISTER */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                {/* Cuenta */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <i className="ri-lock-line"></i> Datos de acceso
                  </p>
                  <div className="flex flex-col gap-4">
                    <div>
                      {fieldLabel("Correo del administrador", true)}
                      <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required placeholder="admin@empresa.com" className={inputClass} />
                    </div>
                    <div>
                      {fieldLabel("Contraseña", true)}
                      <input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Info empresa */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <i className="ri-building-2-line"></i> Información de la empresa
                  </p>
                  <div className="flex flex-col gap-4">
                    <div>
                      {fieldLabel("Nombre de la empresa", true)}
                      <input type="text" value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} required placeholder="Ej. Innovatech S.A. de C.V." className={inputClass} />
                    </div>
                    <div>
                      {fieldLabel("Descripción")}
                      <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} maxLength={500} placeholder="¿A qué se dedica la empresa? Resumen breve..." className={`${inputClass} resize-none`} />
                      <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        {fieldLabel("Sector")}
                        <select value={form.sector} onChange={(e) => setField("sector", e.target.value)} className={`${inputClass} cursor-pointer`}>
                          <option value="">Seleccionar...</option>
                          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        {fieldLabel("Tamaño")}
                        <select value={form.size} onChange={(e) => setField("size", e.target.value)} className={`${inputClass} cursor-pointer`}>
                          <option value="">Seleccionar...</option>
                          {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        {fieldLabel("País")}
                        <input type="text" value={form.country} onChange={(e) => setField("country", e.target.value)} placeholder="Ej. México" className={inputClass} />
                      </div>
                      <div>
                        {fieldLabel("Sitio web")}
                        <input type="url" value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://tuempresa.com" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      {fieldLabel("Actividades principales")}
                      <textarea value={form.mainActivities} onChange={(e) => setField("mainActivities", e.target.value)} rows={2} maxLength={500} placeholder="Ej. Desarrollo de software, consultoría IT, soporte técnico..." className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <i className="ri-phone-line"></i> Contacto de la empresa
                  </p>
                  <div className="flex flex-col gap-4">
                    <div>
                      {fieldLabel("Correo de contacto")}
                      <input type="email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} placeholder="contacto@empresa.com" className={inputClass} />
                    </div>
                    <div>
                      {fieldLabel("Teléfono de contacto")}
                      <input type="tel" value={form.contactPhone} onChange={(e) => setField("contactPhone", e.target.value)} placeholder="+52 55 1234 5678" className={inputClass} />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer whitespace-nowrap mt-1 disabled:opacity-60" style={{ backgroundColor: accent }}>
                  {loading ? <span className="flex items-center justify-center gap-2"><i className="ri-loader-4-line animate-spin"></i>Registrando empresa...</span> : "Registrar empresa"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Al continuar aceptas los términos de uso de Cogniflow. <span className="text-gray-300">•</span> Demo interactiva
          </p>
        </div>
      </main>
    </div>
  );
}