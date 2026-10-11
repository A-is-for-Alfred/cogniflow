import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-auth", {
        body: { username, password },
      });

      if (fnError || !data?.success) {
        setError(data?.error || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("cogniflow_admin_auth", "true");
      onLogin();
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-50">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground-950 mb-2">
              Cogniflow Admin
            </h1>
            <p className="text-sm text-foreground-600">
              Panel de testing - Conversaciones
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-username"
                className="block text-sm font-medium text-foreground-700 mb-1.5"
              >
                Usuario
              </label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-background-200 rounded-md bg-background-50 text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                placeholder="admincogniflow"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-foreground-700 mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-background-200 rounded-md bg-background-50 text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                placeholder="••••••••••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-accent-100 border border-accent-300 text-accent-900 text-sm rounded-md px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full whitespace-nowrap bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-background-50 dark:text-foreground-950 font-medium text-sm py-2.5 rounded-md transition-colors cursor-pointer"
            >
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}