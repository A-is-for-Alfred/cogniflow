import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase, getSafeSession } from "@/lib/supabase";
import EmpleadoHeader from "./components/EmpleadoHeader";
// import DailyInsightCard from "./components/DailyInsightCard";
import ChatSection from "./components/ChatSection";
import GoalsChecklist from "./components/GoalsChecklist";
import ConsistencyChart from "./components/ConsistencyChart";
import FacetasSection from "./components/FacetasSection";
import ReporteSection from "./components/ReporteSection";
import IntroModal from "./components/IntroModal";

interface EmpleadoProfile {
  id: number;
  name: string;
  position: string;
  intro: boolean;
  language: string;
  gender: string;
}

export default function EmpleadoPanel() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<EmpleadoProfile | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [showIntro, setShowIntro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "facet" | "guide">("chat");
  const [currentLanguage, setCurrentLanguage] = useState<string>("es");

  useEffect(() => {
    const loadProfile = async () => {
      const session = await getSafeSession();
      if (!session) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      const { data } = await supabase
        .from("employees")
        .select("id, name, position, intro, language, gender")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        const lang = data.language || "es";
        setCurrentLanguage(lang);
        if (lang !== i18n.language) {
          i18n.changeLanguage(lang);
        }
        if (!data.intro) setShowIntro(true);
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleToggleLanguage = () => {
    const newLang = currentLanguage === "es" ? "en" : "es";
    setCurrentLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleIntroComplete = async () => {
    if (profile) {
      await supabase
        .from("employees")
        .update({ intro: true })
        .eq("id", profile.id);

      setProfile((prev) => prev ? { ...prev, intro: true } : prev);
    }
    setShowIntro(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/demo");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAFAFA" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#A78BFA" }}
          >
            <i className="ri-brain-line text-white text-lg"></i>
          </div>
          <p className="text-sm text-gray-400">{t("panel.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      {showIntro && profile && (
        <IntroModal
          employeeName={profile.name}
          userId={userId}
          employeeId={profile.id}
          onComplete={handleIntroComplete}
        />
      )}
      <EmpleadoHeader
        onBack={() => navigate("/demo")}
        employeeName={profile?.name ?? null}
        onLogout={handleLogout}
        currentLanguage={currentLanguage}
        onToggleLanguage={handleToggleLanguage}
      />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Tab navigation */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("chat")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: activeTab === "chat" ? "#7C3AED" : "#F3F4F6",
              color: activeTab === "chat" ? "white" : "#6B7280",
            }}
          >
            <i className="ri-chat-3-line text-base"></i>
            {t("panel.conversation")}
          </button>
          <button
            onClick={() => setActiveTab("facet")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: activeTab === "facet" ? "#7C3AED" : "#F3F4F6",
              color: activeTab === "facet" ? "white" : "#6B7280",
            }}
          >
            <i className="ri-bar-chart-box-line text-base"></i>
            {t("panel.my_facets")}
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: activeTab === "guide" ? "#7C3AED" : "#F3F4F6",
              color: activeTab === "guide" ? "white" : "#6B7280",
            }}
          >
            <i className="ri-file-text-line text-base"></i>
            {t("panel.report")}
          </button>
        </div>

        {activeTab === "guide" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ReporteSection employeeId={profile?.id} />
            </div>
            <div className="flex flex-col gap-6">
              <GoalsChecklist />
              <ConsistencyChart />
            </div>
          </div>
        ) : activeTab === "facet" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FacetasSection employeeId={profile?.id} />
            </div>
            <div className="flex flex-col gap-6">
              <GoalsChecklist />
              <ConsistencyChart />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Chat */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* <DailyInsightCard /> */}
              <ChatSection employeeName={profile?.name} employeeId={profile?.id} userId={userId} language={profile?.language || "es"} gender={profile?.gender || ""} />
            </div>
            {/* Right column: Goals + Chart */}
            <div className="flex flex-col gap-6">
              <GoalsChecklist />
              <ConsistencyChart />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}