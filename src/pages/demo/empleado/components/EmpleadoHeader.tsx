import { useTranslation } from "react-i18next";

interface EmpleadoHeaderProps {
  onBack: () => void;
  employeeName: string | null;
  onLogout: () => void;
  currentLanguage: string;
  onToggleLanguage: () => void;
}

function getGreeting(t: (key: string) => string): string {
  const hours = new Date().getHours();
  if (hours < 12) return t("header.greeting_morning");
  if (hours < 19) return t("header.greeting_afternoon");
  return t("header.greeting_evening");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function EmpleadoHeader({ onBack, employeeName, onLogout, currentLanguage, onToggleLanguage }: EmpleadoHeaderProps) {
  const { t } = useTranslation();
  const displayName = employeeName ?? "—";
  const initials = employeeName ? getInitials(employeeName) : "?";
  const greeting = getGreeting(t);

  return (
    <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-left-line"></i>
          {t("header.demo")}
        </button>
        <span className="text-gray-200">|</span>
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#A78BFA" }}
          >
            <i className="ri-brain-line text-white text-sm"></i>
          </span>
          <span className="font-bold text-sm text-black">Cogniflow</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language toggle */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-all hover:opacity-80"
          style={{
            backgroundColor: "#F3F4F6",
            color: "#374151",
          }}
          title={t("header.language")}
        >
          <i className="ri-global-line text-base"></i>
          <span>{currentLanguage === "es" ? "ES" : "EN"}</span>
          <i className="ri-arrow-down-s-line text-xs"></i>
        </button>

        <span className="hidden md:block text-sm font-medium text-gray-600">
          {greeting},{" "}
          <span className="text-black font-bold">
            {displayName}
          </span>
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: "#D97706" }}
        >
          {initials}
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer whitespace-nowrap border border-gray-200 hover:border-red-300 rounded-md px-3 py-1.5"
        >
          <i className="ri-logout-box-r-line text-base"></i>
          <span className="hidden sm:inline">{t("header.logout")}</span>
        </button>
      </div>
    </header>
  );
}