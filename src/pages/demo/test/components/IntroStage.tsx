import { useTranslation } from "react-i18next";

interface IntroStageProps {
  lang: string;
  shuffleEnabled: boolean;
  onToggleShuffle: () => void;
  onStart: () => void;
}

export default function IntroStage({ lang, shuffleEnabled, onToggleShuffle, onStart }: IntroStageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center pt-8 md:pt-16 pb-12">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: "#7C3AED" }}
      >
        <i className="ri-user-search-line text-white text-3xl"></i>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
        {t("test.title")}
      </h1>

      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
        {t("test.subtitle")}
      </p>

      <div className="max-w-2xl text-gray-600 text-base leading-relaxed mb-8">
        {t("test.description")}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 max-w-lg w-full flex items-start gap-3 text-left">
        <i className="ri-information-line text-gray-400 text-lg mt-0.5"></i>
        <p className="text-sm text-gray-500">{t("test.disclaimer")}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
        <button
          onClick={onStart}
          className="px-8 py-3 rounded-full text-white font-semibold text-base transition-all hover:opacity-90 cursor-pointer whitespace-nowrap"
          style={{ backgroundColor: "#7C3AED" }}
        >
          {t("test.start")}
        </button>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            className={`w-10 h-6 rounded-full flex items-center transition-colors px-0.5 ${shuffleEnabled ? "" : ""}`}
            style={{ backgroundColor: shuffleEnabled ? "#7C3AED" : "#E5E7EB" }}
            onClick={onToggleShuffle}
          >
            <div
              className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
              style={{ transform: shuffleEnabled ? "translateX(16px)" : "translateX(0)" }}
            />
          </div>
          <span className="text-sm text-gray-600">{t("test.shuffle")}</span>
        </label>
      </div>

      {shuffleEnabled && (
        <p className="text-xs text-gray-400 max-w-md">{t("test.shuffle_desc")}</p>
      )}

      <div className="mt-12 flex items-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <i className="ri-file-list-3-line"></i>
          100 {t("test.items_count")}
        </span>
        <span className="flex items-center gap-1.5">
          <i className="ri-time-line"></i>
          ~15 {t("test.minutes_read")}
        </span>
      </div>
    </div>
  );
}