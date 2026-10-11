import { jsPDF } from "jspdf";
import type { RoadmapObjective } from "@/pages/demo/empleado-v3/components/roadmapTypes";

// ── Types ────────────────────────────────────────────────────────────────────
export interface RoadmapPdfData {
  employeeName: string;
  roadmapSummary: string;
  objectives: RoadmapObjective[];
  lang: "en" | "es";
}

// ── Constants ────────────────────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COLORS = {
  burgundy: [143, 15, 72],
  darkBurgundy: [110, 4, 49],
  lightBg: [250, 247, 248],
  gold: [245, 128, 44],
  text: [61, 61, 61],
  muted: [134, 123, 119],
  gray: [107, 114, 128],
  cardBg: [247, 248, 252],
};

const PEAK_COLORS: [number, number, number][] = [
  [177, 0, 93],
  [117, 43, 140],
  [110, 4, 49],
  [245, 128, 44],
];

const LABELS: Record<string, Record<string, string>> = {
  en: {
    title: "Your roadmap to the summit",
    appliedFor: "Prepared for",
    summary: "Session summary",
    peak: "PEAK",
    objective: "Objective",
    justification: "Why this matters",
    pathLabel: "Source",
    typeLabel: "Type",
    footer: "Cogniflow Companion — Roadmap Guide — Confidential",
    quickWin: "Quick Win",
    theSummit: "The Summit",
    userExpressed: "From your needs",
    corporateMatrix: "From your context",
  },
  es: {
    title: "Tu roadmap hacia la cima",
    appliedFor: "Preparado para",
    summary: "Resumen de la sesión",
    peak: "CUMBRE",
    objective: "Objetivo",
    justification: "Por qué es importante",
    pathLabel: "Origen",
    typeLabel: "Tipo",
    footer: "Cogniflow Companion — Guía de Roadmap — Confidencial",
    quickWin: "Victoria Rápida",
    theSummit: "La Cumbre",
    userExpressed: "Desde tus necesidades",
    corporateMatrix: "Desde tu contexto",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function wrapText(doc: jsPDF, text: string, maxWidth: number, fontFamily: string, fontStyle: string, fontSize: number): string[] {
  doc.setFont(fontFamily, fontStyle);
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
}

function drawLines(doc: jsPDF, lines: string[], x: number, y: number, lineSpacing: number): number {
  let curY = y;
  for (const line of lines) {
    doc.text(line, x, curY);
    curY += lineSpacing;
  }
  return curY;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 22) {
    const fy = PAGE_H - 12;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, fy - 2, PAGE_W - MARGIN, fy - 2);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const t = LABELS.en; // footer is same in both langs
    doc.text(t.footer, PAGE_W / 2, fy + 4, { align: "center" });
    doc.addPage();
    return MARGIN + 4;
  }
  return y;
}

function addPageNumbers(doc: jsPDF): void {
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`${i} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
  }
}

function translateMountainType(mountainType: string | undefined, t: typeof LABELS["en"]): string {
  if (!mountainType) return "";
  if (mountainType === "Quick Win") return t.quickWin;
  if (mountainType === "The Summit") return t.theSummit;
  return mountainType;
}

function translatePathType(pathType: string | undefined, t: typeof LABELS["en"]): string {
  if (!pathType) return "";
  if (pathType === "Path A: User-Expressed Problem") return t.userExpressed;
  if (pathType === "Path B: Corporate Matrix Variable") return t.corporateMatrix;
  return pathType;
}

// ── Main Generator ───────────────────────────────────────────────────────────
export function downloadRoadmapPdf(data: RoadmapPdfData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const t = LABELS[data.lang] || LABELS.es;
  const safeName = (data.employeeName || "Empleado").trim();

  // ═══════════════════════════════════════════════════════════════════
  // COVER / HEADER
  // ═══════════════════════════════════════════════════════════════════
  doc.setFillColor(COLORS.darkBurgundy[0], COLORS.darkBurgundy[1], COLORS.darkBurgundy[2]);
  doc.rect(0, 0, PAGE_W, 54, "F");

  doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.rect(0, 54, PAGE_W, 2.5, "F");

  // Summit icon (small diamond)
  doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("◈", MARGIN, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(t.title, MARGIN + 12, 26);

  if (safeName) {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${t.appliedFor}: ${safeName}`, MARGIN + 12, 40);
  }

  // Date
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const today = new Date().toLocaleDateString(data.lang === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(today, PAGE_W - MARGIN, 40, { align: "right" });

  doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ROADMAP GUIDE", MARGIN, 66);

  let y = 80;

  // ═══════════════════════════════════════════════════════════════════
  // SESSION SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  if (data.roadmapSummary) {
    const summaryLines = wrapText(doc, data.roadmapSummary, CONTENT_W - 26, "helvetica", "italic", 9);
    const cardH = 14 + summaryLines.length * 5;
    y = checkPageBreak(doc, y, cardH + 6);

    doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.roundedRect(MARGIN, y, 3, cardH, 1, 1, "F");

    doc.setFillColor(253, 246, 238);
    doc.roundedRect(MARGIN + 3, y, CONTENT_W - 3, cardH, 3, 3, "F");

    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(t.summary.toUpperCase(), MARGIN + 12, y + 8);

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(summaryLines, MARGIN + 12, y + 14);

    y += cardH + 10;
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBJECTIVES
  // ═══════════════════════════════════════════════════════════════════
  if (data.objectives.length > 0) {
    y = checkPageBreak(doc, y, 20);

    doc.setFillColor(COLORS.darkBurgundy[0], COLORS.darkBurgundy[1], COLORS.darkBurgundy[2]);
    doc.roundedRect(MARGIN, y, CONTENT_W, 14, 3, 3, "F");

    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("◈", MARGIN + 8, y + 9, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const objectivesLabel = data.lang === "es" ? "TUS OBJETIVOS" : "YOUR OBJECTIVES";
    doc.text(objectivesLabel, MARGIN + 18, y + 7.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const countLabel = data.lang === "es"
      ? `${data.objectives.length} cumbres en tu ruta`
      : `${data.objectives.length} peaks on your route`;
    doc.text(countLabel, MARGIN + 18, y + 12);

    y += 22;

    const Q_CARD_PAD_LEFT = 3;
    const Q_CARD_PAD_RIGHT = 16;
    const Q_TEXT_X = MARGIN + 20;
    const Q_TEXT_R = MARGIN + CONTENT_W - Q_CARD_PAD_RIGHT;
    const Q_TEXT_W = Q_TEXT_R - Q_TEXT_X;
    const Q_LINE_SPACING = 5.2;

    for (let oi = 0; oi < data.objectives.length; oi += 1) {
      const obj = data.objectives[oi];
      const peakColor = PEAK_COLORS[oi % PEAK_COLORS.length];

      const titleLines = wrapText(doc, obj.title || "", Q_TEXT_W, "helvetica", "bold", 10);
      const titleH = titleLines.length * Q_LINE_SPACING;

      const justText = obj.justification || obj.rationale?.headline || "";
      const justificationLines = wrapText(doc, justText, Q_TEXT_W, "helvetica", "normal", 8.5);
      const justificationH = justificationLines.length * 4.5 + 2;

      const mountainType = translateMountainType(obj.mountain_type, t);
      const pathType = translatePathType(obj.path_type, t);

      const metaStr = `${t.typeLabel}: ${mountainType}  —  ${t.pathLabel}: ${pathType}`;
      const metaLines = wrapText(doc, metaStr, Q_TEXT_W, "helvetica", "normal", 7);
      const metaH = metaLines.length * 3.6;

      const headerH = 14;
      const spacingTitleMeta = 3;
      const spacingMetaJustification = 3;

      const cardH = headerH + titleH + spacingTitleMeta + metaH + spacingMetaJustification + justificationH + 8;

      y = checkPageBreak(doc, y, cardH + 8);
      const cardBottom = y + cardH;

      // Card bg
      doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 4, 4, "F");

      // Colored left bar
      doc.setFillColor(peakColor[0], peakColor[1], peakColor[2]);
      doc.rect(MARGIN, y, Q_CARD_PAD_LEFT, cardH, "F");

      // Number circle
      doc.setFillColor(peakColor[0], peakColor[1], peakColor[2]);
      doc.circle(MARGIN + 12, y + 8.5, 5.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(String(oi + 1), MARGIN + 12, y + 10.5, { align: "center" });

      // "PEAK N" label
      doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text(`${t.peak} ${oi + 1}`, MARGIN + 20, y + 8.5);

      // Objective number tag (top-right)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      const tagText = `${t.objective} ${oi + 1}`;
      const tagW = doc.getTextWidth(tagText) + 10;
      const tagX = MARGIN + CONTENT_W - Q_CARD_PAD_RIGHT - tagW;
      doc.setFillColor(peakColor[0], peakColor[1], peakColor[2]);
      doc.roundedRect(tagX, y + 3, tagW, 6.5, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(tagText, tagX + tagW / 2, y + 7.2, { align: "center" });

      // Title
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      let curY = drawLines(doc, titleLines, Q_TEXT_X, y + headerH + 2, Q_LINE_SPACING);

      // Meta line (mountain type + path type)
      curY += spacingTitleMeta;
      doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      curY = drawLines(doc, metaLines, Q_TEXT_X, curY, 3.6);

      // Justification
      curY += spacingMetaJustification;
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      drawLines(doc, justificationLines, Q_TEXT_X, curY, 4.5);

      y = cardBottom + 8;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // FOOTER + PAGE NUMBERS
  // ═══════════════════════════════════════════════════════════════════
  const fy = PAGE_H - 12;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, fy - 2, PAGE_W - MARGIN, fy - 2);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(t.footer, PAGE_W / 2, fy + 4, { align: "center" });

  addPageNumbers(doc);

  // ═══════════════════════════════════════════════════════════════════
  // DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════
  const fileName = safeName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "").trim() || "roadmap";
  doc.save(`Cogniflow_Roadmap_${fileName}.pdf`);
}