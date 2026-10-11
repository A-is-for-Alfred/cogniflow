import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ALL_ITEMS,
  FACETS,
  DICHOTOMIES,
  K_PCI,
  ITEMS_PER_PAGE,
  TOTAL_ITEMS,
  DECISION_STYLES,
  FUNCTION_DYNAMICS,
  APPLIED_TABLES,
  LIKERT_LABELS_ES,
  LIKERT_LABELS_EN,
  type TestItem,
  type FacetDef,
  type DichotomyDef,
  type DecisionStyle,
  type FunctionSet,
  type AppliedTableDef,
} from "./data";
import IntroStage from "./components/IntroStage";
import QuizStage from "./components/QuizStage";
import ReportStage from "./components/ReportStage";

export interface FacetResult {
  facetId: number;
  raw: number;
  score: number;
  absScore: number;
  category: "midzone" | "in_preference" | "out_preference";
  pole: "left" | "right";
}

export interface DichotomyResult {
  code: string;
  total: number;
  letter: string;
  pci: number;
  pciLevel: string;
}

export interface TestResult {
  type: string;
  dichotomies: DichotomyResult[];
  facets: FacetResult[];
  polarity: number;
  outOfPreference: number[];
  decisionStyle: DecisionStyle;
  functionDynamics: FunctionSet;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function computeResults(answers: (number | null)[]): TestResult {
  // 1. Facet raw scores
  const facetResults: FacetResult[] = FACETS.map((facet) => {
    let raw = 0;
    facet.items.forEach((item) => {
      const idx = item.id - 1;
      const v = answers[idx] ?? 3; // unanswered = 3
      const vRecoded = item.key === "D" ? v : 6 - v;
      raw += vRecoded;
    });
    const score = Math.round((raw - 15) / 2);
    const absScore = Math.abs(score);
    const pole = score >= 0 ? "left" : "right";
    let category: FacetResult["category"] = "midzone";
    if (absScore >= 2) category = "in_preference";
    return { facetId: facet.id, raw, score, absScore, category, pole };
  });

  // 2. Dichotomy totals and PCI
  const dichResults: DichotomyResult[] = DICHOTOMIES.map((dich) => {
    const facetsForDich = facetResults.filter((f) => {
      const facetDef = FACETS.find((fd) => fd.id === f.facetId)!;
      return facetDef.dich === dich.code;
    });
    const total = facetsForDich.reduce((sum, f) => sum + f.score, 0);
    const letter = total >= 0 ? dich.leftLetter : dich.rightLetter;
    const pci = Math.min(30, Math.round(Math.abs(total) * K_PCI));
    let pciLevel = "level_undefined";
    if (pci === 0) pciLevel = "level_undefined";
    else if (pci <= 5) pciLevel = "level_light";
    else if (pci <= 15) pciLevel = "level_moderate";
    else if (pci <= 25) pciLevel = "level_clear";
    else pciLevel = "level_very_clear";
    return { code: dich.code, total, letter, pci, pciLevel };
  });

  // 3. Type
  const type = dichResults.map((d) => d.letter).join("");

  // 4. Categorize facets against type
  const categorizedFacets = facetResults.map((f) => {
    const facetDef = FACETS.find((fd) => fd.id === f.facetId)!;
    const dich = DICHOTOMIES.find((d) => d.code === facetDef.dich)!;
    const typeLetterForDich = dichResults.find((dr) => dr.code === dich.code)!.letter;
    const preferredPole = typeLetterForDich === dich.leftLetter ? "left" : "right";
    let category: FacetResult["category"] = f.category;
    if (f.absScore >= 2) {
      category = f.pole === preferredPole ? "in_preference" : "out_preference";
    }
    return { ...f, category };
  });

  // 5. Polarity
  const sumSq = categorizedFacets.reduce((sum, f) => sum + f.score * f.score, 0);
  const polarity = Math.round(100 * Math.sqrt(sumSq / 20) / 5);

  // 6. Out of preference facets
  const outOfPreference = categorizedFacets
    .filter((f) => f.category === "out_preference")
    .map((f) => f.facetId);

  // 7. Decision style (facet 11 and 12)
  const f11 = categorizedFacets.find((f) => f.facetId === 11)!;
  const f12 = categorizedFacets.find((f) => f.facetId === 12)!;
  const pos11 = f11.absScore >= 2 ? (f11.pole === "left" ? "L" : "R") : "M";
  const pos12 = f12.absScore >= 2 ? (f12.pole === "left" ? "L" : "R") : "M";
  const decisionStyle = DECISION_STYLES[`${pos11}${pos12}`];

  // 8. Function dynamics
  const functionDynamics = FUNCTION_DYNAMICS[type] || { dominant: "—", auxiliary: "—", tertiary: "—", inferior: "—" };

  return {
    type,
    dichotomies: dichResults,
    facets: categorizedFacets,
    polarity,
    outOfPreference,
    decisionStyle,
    functionDynamics,
  };
}

export default function TypeTestPage() {
  const { t, i18n } = useTranslation();
  const [stage, setStage] = useState<"intro" | "quiz" | "report">("intro");
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL_ITEMS).fill(null));
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const lang = i18n.language === "es" ? "es" : "en";

  const itemsForQuiz = useMemo(() => {
    if (shuffleEnabled && shuffleOrder.length > 0) {
      return shuffleOrder.map((idx) => ALL_ITEMS[idx]);
    }
    return ALL_ITEMS;
  }, [shuffleEnabled, shuffleOrder]);

  const handleToggleLanguage = useCallback(() => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  }, [i18n]);

  const handleStart = useCallback(() => {
    if (shuffleEnabled) {
      setShuffleOrder(shuffleArray(ALL_ITEMS.map((_, i) => i)));
    } else {
      setShuffleOrder([]);
    }
    setCurrentPage(0);
    setAnswers(Array(TOTAL_ITEMS).fill(null));
    setStage("quiz");
  }, [shuffleEnabled]);

  const handleAnswer = useCallback((itemIndex: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      // itemIndex is the position in the quiz (shuffled or not)
      // We need to map back to the original item id
      const item = itemsForQuiz[itemIndex];
      next[item.id - 1] = value;
      return next;
    });
  }, [itemsForQuiz]);

  const handleSubmit = useCallback(() => {
    setStage("report");
  }, []);

  const handleRestart = useCallback(() => {
    setStage("intro");
    setAnswers(Array(TOTAL_ITEMS).fill(null));
    setCurrentPage(0);
  }, []);

  const results = useMemo(() => {
    if (stage !== "report") return null;
    return computeResults(answers);
  }, [stage, answers]);

  const likertLabels = lang === "es" ? LIKERT_LABELS_ES : LIKERT_LABELS_EN;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#7C3AED" }}>
              <i className="ri-brain-line text-white text-sm"></i>
            </span>
            <span className="font-bold text-sm text-black">Cogniflow</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{t("test.title")}</span>
          </div>
          <button
            onClick={handleToggleLanguage}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-all hover:opacity-80"
            style={{ backgroundColor: "#F3F4F6", color: "#374151" }}
          >
            <i className="ri-global-line text-base"></i>
            <span>{lang === "es" ? "ES" : "EN"}</span>
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {stage === "intro" && (
          <IntroStage
            lang={lang}
            shuffleEnabled={shuffleEnabled}
            onToggleShuffle={() => setShuffleEnabled((v) => !v)}
            onStart={handleStart}
          />
        )}

        {stage === "quiz" && (
          <QuizStage
            lang={lang}
            items={itemsForQuiz}
            answers={answers}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onAnswer={handleAnswer}
            onSubmit={handleSubmit}
            likertLabels={likertLabels}
          />
        )}

        {stage === "report" && results && (
          <ReportStage
            lang={lang}
            results={results}
            answers={answers}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}