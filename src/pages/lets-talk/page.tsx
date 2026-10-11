import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const benefits = [
  { icon: "ri-lock-line", label: "100% privado", color: "#7C3AED" },
  { icon: "ri-user-heart-line", label: "IA + coach humana", color: "#A78BFA" },
  { icon: "ri-heart-pulse-line", label: "Bienestar integral", color: "#EDE9FE" },
  { icon: "ri-line-chart-line", label: "+34% productividad", color: "#DDD6FE" },
];

export default function LetsTalk() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const textarea = form.querySelector("textarea");
    if (textarea && textarea.value.length > 500) return;

    setSubmitting(true);
    const data = new URLSearchParams();
    new FormData(form).forEach((val, key) => {
      data.append(key, val as string);
    });

    try {
      await fetch("https://readdy.ai/api/form/d85vblq1csuacpqtd85g", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#F9F6FF" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-0 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-6%] w-[500px] h-[500px] rounded-full opacity-25" style={{ backgroundColor: "#7C3AED", filter: "blur(100px)" }} />
          <div className="absolute top-[20%] left-[-8%] w-[380px] h-[380px] rounded-full opacity-20" style={{ backgroundColor: "#A78BFA", filter: "blur(90px)" }} />
          <div className="absolute bottom-[-5%] right-[20%] w-[300px] h-[300px] rounded-full opacity-15" style={{ backgroundColor: "#DDD6FE", filter: "blur(80px)" }} />
        </div>

        <div ref={heroRef} className="relative max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#7C3AED" }}>
            Solicitar demo
          </p>

          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
            <h1 className="text-6xl md:text-8xl lg:text-[110px] font-bold text-black leading-none tracking-tight">
              Hablemos<br />
              <span className="relative inline-block" style={{ color: "#7C3AED" }}>
                juntos.
                <span className="absolute -bottom-2 left-0 w-full h-3 rounded-full opacity-40" style={{ backgroundColor: "#A78BFA" }} />
              </span>
            </h1>

            <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end pb-4">
              {benefits.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: b.color,
                    color: b.color === "#7C3AED" || b.color === "#A78BFA" ? "white" : "black",
                  }}
                >
                  <i className={`${b.icon} text-base`}></i>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed mb-0">
            Cuéntanos sobre tu organización y descubre cómo Cogniflow puede transformar el bienestar y el desarrollo de tu equipo.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="px-6 md:px-16 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Contact Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div
                className="rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-6 min-h-[480px]"
                style={{ backgroundColor: "#7C3AED" }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                  style={{ backgroundColor: "#A78BFA" }}
                >
                  <i className="ri-check-line text-white"></i>
                </div>
                <h2 className="text-4xl font-bold text-white">¡Listo!</h2>
                <p className="text-white/70 text-base max-w-sm leading-relaxed">
                  Gracias por tu interés en Cogniflow. Nos pondremos en contacto contigo en menos de un día hábil para agendar tu demo personalizada.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm text-black cursor-pointer whitespace-nowrap transition-colors"
                  style={{ backgroundColor: "#EDE9FE" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#DDD6FE")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#EDE9FE")}
                >
                  Volver al inicio
                  <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
            ) : (
              <form
                data-readdy-form
                id="cogniflow-demo-form"
                onSubmit={handleSubmit}
                className="rounded-3xl p-8 md:p-10 flex flex-col gap-6"
                style={{ backgroundColor: "#fff" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#7C3AED" }}
                  >
                    <i className="ri-brain-line text-white text-base"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">Agenda tu demo de Cogniflow</p>
                    <p className="text-xs text-gray-400">Te contactamos en menos de 1 día hábil</p>
                  </div>
                </div>

                {/* Name + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tu nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="María García"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-black placeholder-gray-300 outline-none focus:border-violet-400 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      name="company"
                      required
                      placeholder="Acme Corp"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-black placeholder-gray-300 outline-none focus:border-violet-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tu rol
                  </label>
                  <input
                    type="text"
                    name="role"
                    placeholder="Directora de Recursos Humanos"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-black placeholder-gray-300 outline-none focus:border-violet-400 transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="maria@empresa.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-black placeholder-gray-300 outline-none focus:border-violet-400 transition-colors"
                  />
                </div>

                {/* Team size */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tamaño del equipo
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["1-25 personas", "26-100 personas", "101-500 personas", "500+ personas"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 cursor-pointer text-xs font-medium text-gray-600 hover:border-violet-300 transition-colors has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50 has-[:checked]:text-violet-700"
                      >
                        <input
                          type="radio"
                          name="team_size"
                          value={opt}
                          className="w-3.5 h-3.5 accent-violet-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Interest areas */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    &iquest;Qué te interesa más?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "Prevención del burnout",
                      "Coaching escalable",
                      "Productividad de líderes",
                      "Bienestar integral",
                      "Neurofeedback",
                      "Reportes para supervisores",
                    ].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 cursor-pointer text-xs font-medium text-gray-600 hover:border-violet-300 transition-colors has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50 has-[:checked]:text-violet-700"
                      >
                        <input
                          type="checkbox"
                          name="interest"
                          value={opt}
                          className="w-3.5 h-3.5 accent-violet-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Cu&eacute;ntanos m&aacute;s (opcional)
                    </label>
                    <span className={`text-xs ${charCount > 450 ? "text-red-400" : "text-gray-300"}`}>
                      {charCount}/500
                    </span>
                  </div>
                  <textarea
                    name="message"
                    rows={3}
                    maxLength={500}
                    placeholder="¿Cuál es el principal desafío de bienestar o desarrollo en tu organización?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-black placeholder-gray-300 outline-none focus:border-violet-400 transition-colors resize-none"
                    onChange={e => setCharCount(e.target.value.length)}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl text-sm text-white transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                  style={{ backgroundColor: "#7C3AED" }}
                  onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6D28D9"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7C3AED"; }}
                >
                  {submitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Enviando…
                    </>
                  ) : (
                    <>
                      Solicitar demo
                      <i className="ri-arrow-right-line"></i>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-300">
                  Tu información es confidencial. No compartimos datos con terceros.
                </p>
              </form>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Hero image */}
            <div className="relative rounded-3xl overflow-hidden" style={{ height: "280px" }}>
              <img
                src="https://readdy.ai/api/search-image?query=professional%20woman%20coach%20smiling%20with%20tablet%20in%20modern%20bright%20office%20warmth%20empathy%20human%20connection%20technology%20purple%20accent%20corporate%20wellness%20leadership%20development&width=600&height=280&seq=lt01&orientation=landscape"
                alt="Equipo Cogniflow"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div
                className="absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-1.5"
                style={{ backgroundColor: "#7C3AED" }}
              >
                <i className="ri-brain-line"></i> IA + Coaching humano
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg leading-tight">
                  No somos un chatbot. Somos un compañero de desarrollo real.
                </p>
              </div>
            </div>

            {/* Info cards */}
            <div
              className="rounded-2xl p-6 flex items-start gap-4"
              style={{ backgroundColor: "#7C3AED" }}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <i className="ri-shield-check-line text-lg text-white"></i>
              </div>
              <div>
                <p className="font-bold text-base text-white mb-0.5">Privacidad garantizada</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Cada conversación es 100% privada. Los supervisores solo reciben reportes agregados, nunca el contenido de las sesiones.
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 flex items-start gap-4"
              style={{ backgroundColor: "#EDE9FE" }}
            >
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                <i className="ri-smartphone-line text-lg text-black"></i>
              </div>
              <div>
                <p className="font-bold text-base text-black mb-0.5">Disponible en todos tus dispositivos</p>
                <p className="text-sm text-black/60 leading-relaxed">
                  Cogniflow funciona en app móvil y en web. Tus colaboradores lo llevan en el bolsillo.
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 flex items-start gap-4"
              style={{ backgroundColor: "#A78BFA" }}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <i className="ri-mail-line text-lg text-white"></i>
              </div>
              <div>
                <p className="font-bold text-base text-white mb-0.5">Escríbenos directamente</p>
                <a href="mailto:hola@cogniflow.ai" className="text-sm text-white/80 hover:text-white hover:underline cursor-pointer">
                  hola@cogniflow.ai
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom strip */}
      <section className="px-6 md:px-16 pb-20">
        <div
          className="max-w-7xl mx-auto rounded-3xl px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative"
          style={{ backgroundColor: "#7C3AED" }}
        >
          <div
            className="absolute top-[-30%] right-[-5%] w-[300px] h-[300px] rounded-full opacity-20 pointer-events-none"
            style={{ backgroundColor: "#A78BFA", filter: "blur(60px)" }}
          />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
              ¿Quieres explorar primero?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Conoce la plataforma<br />
              <span style={{ color: "#A78BFA" }}>antes de comprometerte.</span>
            </h2>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/what-we-do"
              className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded-full text-sm text-white border border-white/30 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              La plataforma
              <i className="ri-arrow-right-line"></i>
            </Link>
            <Link
              to="/how-we-work"
              className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded-full text-sm text-black cursor-pointer whitespace-nowrap transition-colors"
              style={{ backgroundColor: "#EDE9FE" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#DDD6FE")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#EDE9FE")}
            >
              Metodología
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}