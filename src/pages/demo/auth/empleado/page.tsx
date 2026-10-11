import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getSafeSession } from "@/lib/supabase";

type AuthMode = "login" | "register";

const accent = "#D97706";
const accentLight = "#FFFBEB";

const GENDER_OPTIONS = [
  { value: "", label: "Seleccionar..." },
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "no_binario", label: "No binario" },
  { value: "prefiero_no_decir", label: "Prefiero no decirlo" },
];

export default function EmpleadoAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [workSchedule, setWorkSchedule] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      const { data } = await supabase.from("companies").select("id, name").order("name");
      setCompanies(data ?? []);
      setLoadingCompanies(false);
    };
    fetchCompanies();
  }, []);

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

      const session = await getSafeSession();
      const userId = session?.user.id;

      const { data: emp } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      if (!emp) throw new Error("No se encontró un perfil de empleado para este correo.");

      const dest = sessionStorage.getItem("empleado_redirect") || "/demo/empleado";
      sessionStorage.removeItem("empleado_redirect");
      navigate(dest);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("El nombre es obligatorio."); return; }
    if (!companyId) { setError("Debes seleccionar una empresa."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: undefined },
      });
      if (signUpError) throw signUpError;

      const userId = signUpData.user?.id;
      if (!userId) throw new Error("No se pudo crear la cuenta.");

      // Asegurar sesión activa antes del insert (RLS requiere auth.uid())
      let activeSession = signUpData.session;
      if (!activeSession) {
        activeSession = await getSafeSession();
      }
      if (!activeSession) {
        // Intentar sign in explícito para obtener sesión
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw new Error("Cuenta creada pero no se pudo iniciar sesión automáticamente. Intenta iniciar sesión manualmente.");
        if (!signInData.session) throw new Error("No se pudo establecer la sesión. Por favor inicia sesión manualmente.");
      }

      const insertPayload: Record<string, unknown> = {
        user_id: userId,
        name: name.trim(),
        email,
        position: position.trim() || null,
        gender: gender || null,
        phone: phone.trim() || null,
        work_schedule: workSchedule.trim() || null,
        joined_company_at: joinDate || null,
        language: language || null,
      };
      if (companyId) insertPayload.company_id = Number(companyId);

      const { error: profileError } = await supabase.from("employees").insert(insertPayload);
      if (profileError) {
        // Si falla el insert, limpiar la sesión para no dejar usuario sin perfil
        await supabase.auth.signOut();
        throw new Error(`Error al guardar tu perfil: ${profileError.message}`);
      }

      const dest = sessionStorage.getItem("empleado_redirect") || "/demo/empleado";
      sessionStorage.removeItem("empleado_redirect");
      navigate(dest);
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full opacity-25" style={{ backgroundColor: "#FDE68A", filter: "blur(100px)" }} />
        <div className="absolute bottom-[0%] left-[-6%] w-[380px] h-[380px] rounded-full opacity-20" style={{ backgroundColor: "#FCD34D", filter: "blur(90px)" }} />
      </div>

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
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: accentLight, color: accent }}>
              <i className="ri-user-smile-line"></i>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: accentLight, color: accent }}>
              Colaborador
            </span>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100" style={{ boxShadow: "0 4px 40px rgba(217,119,6,0.07)" }}>
            <div className="flex p-1 rounded-xl mb-6" style={{ backgroundColor: "#F3F4F6" }}>
              {(["login", "register"] as AuthMode[]).map((m) => (
                <button key={m} onClick={() => switchMode(m)}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: mode === m ? "#fff" : "transparent", color: mode === m ? accent : "#9CA3AF", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}
                >
                  {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-black mb-1">
              {mode === "login" ? "¡Hola de nuevo!" : "Crea tu espacio"}
            </h1>
            <p className="text-sm text-gray-400 mb-7">
              {mode === "login"
                ? "Accede a tu espacio personal de bienestar."
                : "Regístrate y comienza a conversar con Cogniflow."}
            </p>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2">
                <i className="ri-error-warning-line mt-0.5 flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            {mode === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  {fieldLabel("Correo electrónico", true)}
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="tu@correo.com" className={inputClass} />
                </div>
                <div>
                  {fieldLabel("Contraseña", true)}
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className={inputClass} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer whitespace-nowrap mt-2 disabled:opacity-60" style={{ backgroundColor: accent }}>
                  {loading ? <span className="flex items-center justify-center gap-2"><i className="ri-loader-4-line animate-spin"></i>Ingresando...</span> : "Entrar a mi espacio"}
                </button>
              </form>
            )}

            {mode === "register" && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div>
                  {fieldLabel("Nombre completo", true)}
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Tu nombre" className={inputClass} />
                </div>
                <div>
                  {fieldLabel("Correo electrónico", true)}
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@correo.com" className={inputClass} />
                </div>
                <div>
                  {fieldLabel("Contraseña", true)}
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" className={inputClass} />
                </div>
                <div>
                  {fieldLabel("Empresa", true)}
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                    disabled={loadingCompanies}
                    required
                  >
                    <option value="">{loadingCompanies ? "Cargando empresas..." : "Selecciona tu empresa"}</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {!loadingCompanies && companies.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">No hay empresas registradas aún. Pide a tu empresa que se registre primero.</p>
                  )}
                </div>
                <div>
                  {fieldLabel("Puesto / Cargo")}
                  <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Ej. Gerente de Operaciones" className={inputClass} />
                </div>
                <div>
                  {fieldLabel("Idioma preferido", true)}
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className={`${inputClass} cursor-pointer`}>
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {fieldLabel("Género")}
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={`${inputClass} cursor-pointer`}>
                      {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    {fieldLabel("Fecha de ingreso")}
                    <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {fieldLabel("Teléfono")}
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 55 1234" className={inputClass} />
                  </div>
                  <div>
                    {fieldLabel("Horario laboral")}
                    <input type="text" value={workSchedule} onChange={(e) => setWorkSchedule(e.target.value)} placeholder="Ej. L-V 9am–6pm" className={inputClass} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer whitespace-nowrap mt-2 disabled:opacity-60" style={{ backgroundColor: accent }}>
                  {loading ? <span className="flex items-center justify-center gap-2"><i className="ri-loader-4-line animate-spin"></i>Creando cuenta...</span> : "Crear mi espacio"}
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