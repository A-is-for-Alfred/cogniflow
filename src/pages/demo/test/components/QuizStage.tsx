import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { ITEMS_PER_PAGE, TOTAL_ITEMS, type TestItem } from "../data";

interface QuizStageProps {
  lang: string;
  items: TestItem[];
  answers: (number | null)[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onAnswer: (itemIndex: number, value: number) => void;
  onSubmit: () => void;
  likertLabels: string[];
}

const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);

export default function QuizStage({
  lang,
  items,
  answers,
  currentPage,
  onPageChange,
  onAnswer,
  onSubmit,
  likertLabels,
}: QuizStageProps) {
  const { t } = useTranslation();

  const pageItems = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, currentPage]);

  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const pageStartIndex = currentPage * ITEMS_PER_PAGE;

  const handleSelect = (pageItemIndex: number, value: number) => {
    onAnswer(pageStartIndex + pageItemIndex, value);
  };

  const isLastPage = currentPage === TOTAL_PAGES - 1;

  const progressPct = Math.round((answeredCount / TOTAL_ITEMS) * 100);

  const likertColors = [
    "",
    "#EF4444", // 1 - strongly disagree
    "#F59E0B", // 2 - disagree
    "#9CA3AF", // 3 - neither
    "#10B981", // 4 - agree
    "#059669", // 5 - strongly agree
  ];

  return (
    <div className="pb-12">
      {/* Progress bar */}
      <div className="sticky top-[57px] z-40 bg-white/90 backdrop-blur border-b border-gray-100 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">
            {t("test.progress")}: {answeredCount}/{TOTAL_ITEMS} ({progressPct}%)
          </span>
          <span className="text-xs font-medium text-gray-500">
            {t("test.page")} {currentPage + 1} {t("test.of")} {TOTAL_PAGES}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: "#7C3AED" }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {pageItems.map((item, idx) => {
          const globalIdx = pageStartIndex + idx;
          const currentValue = answers[item.id - 1];
          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-xs font-mono text-gray-400 mt-1 shrink-0 w-8">
                  {item.id}
                </span>
                <p className="text-base text-gray-800 leading-relaxed">
                  {lang === "es" ? item.textES : item.textEN}
                </p>
              </div>

              <div className="pl-11">
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const selected = currentValue === val;
                    return (
                      <button
                        key={val}
                        onClick={() => handleSelect(idx, val)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all cursor-pointer ${
                          selected
                            ? "border-transparent text-white"
                            : "border-gray-200 hover:border-gray-300 text-gray-500"
                        }`}
                        style={
                          selected
                            ? { backgroundColor: likertColors[val] }
                            : { backgroundColor: "white" }
                        }
                      >
                        <span className="text-lg font-bold">{val}</span>
                        <span className="text-[10px] leading-tight text-center hidden sm:block">
                          {likertLabels[val]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-[10px] text-gray-400">{likertLabels[1]}</span>
                  <span className="text-[10px] text-gray-400">{likertLabels[5]}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 sticky bottom-4 z-30 bg-white/90 backdrop-blur border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all whitespace-nowrap"
        >
          <i className="ri-arrow-left-line"></i>
          {t("test.prev")}
        </button>

        <div className="text-xs text-gray-400 hidden sm:block">
          {answeredCount} {t("test.answered")} · {TOTAL_ITEMS - answeredCount} {t("test.remaining")}
        </div>

        {isLastPage ? (
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: "#7C3AED" }}
          >
            {t("test.submit")}
            <i className="ri-check-line"></i>
          </button>
        ) : (
          <button
            onClick={() => onPageChange(Math.min(TOTAL_PAGES - 1, currentPage + 1))}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: "#7C3AED" }}
          >
            {t("test.next")}
            <i className="ri-arrow-right-line"></i>
          </button>
        )}
      </div>
    </div>
  );
}