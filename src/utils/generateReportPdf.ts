import { jsPDF } from "jspdf";

// ── Types ────────────────────────────────────────────────────────────────────
interface TensionSource {
  tension_id?: string;
  tension_name?: string;
  tension_type?: string;
  facets?: string[];
}

interface LeverSource {
  lever_id?: string;
  window_facet?: string;
  is_lead_window?: boolean;
  acts_on_facets?: string[];
  adjustment_direction?: string;
}

interface Question {
  number: number;
  question_text: string;
  tension_source: TensionSource | null;
  lever_source: LeverSource | null;
  type_note: string;
  chart_ref: string;
  confidence_tier?: string;
}

export interface ReportePdfData {
  profile_name: string;
  mbti_type: string | null;
  profile_summary: string | null;
  questions: Question[] | null;
  one_thing_worth_noticing: string | null;
  coaching_note: string | null;
  fecha_aplicacion: string;
  tipo_reportado: string | null;
}

// ── Constants ────────────────────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2; // 178mm total content width

const COLORS = {
  dark: [27, 42, 74],
  gold: [200, 146, 42],
  gray: [107, 114, 128],
  text: [31, 41, 55],
  muted: [156, 163, 175],
  cardBg: [247, 248, 252],
};

const CHART_LABELS: Record<string, string> = {
  ei: "E-I",
  sn: "S-N",
  tf: "T-F",
  jp: "J-P",
};

// ── PDF Helpers ──────────────────────────────────────────────────────────────

/**
 * Safe text wrapping: explicitly sets font+size before measuring,
 * then restores original font size. This prevents the "wrong font size"
 * bug where splitTextToSize uses a stale font size from a previous draw.
 */
function wrapText(doc: jsPDF, text: string, maxWidth: number, fontFamily: string, fontStyle: string, fontSize: number): string[] {
  doc.setFont(fontFamily, fontStyle);
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
}

/**
 * Draw wrapped text lines starting at (x, y). Returns the y position after all lines.
 */
function drawLines(doc: jsPDF, lines: string[], x: number, y: number, lineSpacing: number): number {
  let curY = y;
  for (const line of lines) {
    doc.text(line, x, curY);
    curY += lineSpacing;
  }
  return curY;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 20) {
    // Draw footer on current page
    const fy = PAGE_H - 12;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, fy - 2, PAGE_W - MARGIN, fy - 2);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("MIA LUNA Type Companion Guide — Confidential", PAGE_W / 2, fy + 4, { align: "center" });

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

function formatSource(q: Question): string {
  if (q.lever_source) {
    const actsOn = q.lever_source.acts_on_facets || [];
    const window = q.lever_source.window_facet || "";
    return actsOn.length > 0
      ? `${window} — growth lever — acts on: ${actsOn.join(", ")}`
      : `${window} — growth lever`;
  }
  if (q.tension_source) {
    const name = q.tension_source.tension_name || "";
    return name;
  }
  return "";
}

// ── Question Card Layout ─────────────────────────────────────────────────────
//
//  +--[gold bar]---+-----------------[card bg]------------------[tag]--+  ← MARGIN..MARGIN+CONTENT_W
//  |  3mm          | [num circle] PREGUNTA N                          |
//  |               |          "Question text starts here and wraps    |
//  |               |           within the safe content area..."       |
//  |               |  Chart: E-I — insight                            |
//  |               |  source info...                                  |
//  +---------------+--------------------------------------------------+
//
// Question text area: starts at Q_TEXT_X = MARGIN + 20, ends at Q_TEXT_R = MARGIN + CONTENT_W - 18
// Question text max width: Q_TEXT_W = Q_TEXT_R - Q_TEXT_X

const Q_CARD_PAD_LEFT = 3;   // gold bar width
const Q_CARD_PAD_RIGHT = 18;  // right padding inside card (leaves room for the tag)
const Q_TEXT_X = MARGIN + 20; // text start (after gold bar + number circle area)
const Q_TEXT_R = MARGIN + CONTENT_W - Q_CARD_PAD_RIGHT;
const Q_TEXT_W = Q_TEXT_R - Q_TEXT_X; // = CONTENT_W - 20 - 18 = 178 - 38 = 140mm
const Q_LINE_SPACING = 5.2;

// ── Main Generator ───────────────────────────────────────────────────────────
export function downloadReportPdf(data: ReportePdfData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const profileName = data.profile_name || data.tipo_reportado || "Tu perfil";

  // ═══════════════════════════════════════════════════════════════════
  // COVER / HEADER
  // ═══════════════════════════════════════════════════════════════════
  doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.rect(0, 0, PAGE_W, 48, "F");

  doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.rect(0, 48, PAGE_W, 2.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(profileName, MARGIN, 28);

  if (data.mbti_type) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.text(data.mbti_type, MARGIN, 38);
  }

  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const fecha = data.fecha_aplicacion
    ? new Date(data.fecha_aplicacion).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })
    : "-";
  doc.text(`Aplicado: ${fecha}`, PAGE_W - MARGIN, 38, { align: "right" });

  doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("COMPANION GUIDE", MARGIN, 60);

  let y = 74;

  // ═══════════════════════════════════════════════════════════════════
  // PROFILE SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  if (data.profile_summary) {
    const summaryLines = wrapText(doc, data.profile_summary, CONTENT_W - 26, "helvetica", "italic", 9);
    const cardH = 14 + summaryLines.length * 5;
    y = checkPageBreak(doc, y, cardH + 6);

    // Gold left accent
    doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.roundedRect(MARGIN, y, 3, cardH, 1, 1, "F");

    // Card bg
    doc.setFillColor(253, 248, 236);
    doc.roundedRect(MARGIN + 3, y, CONTENT_W - 3, cardH, 3, 3, "F");

    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("TU PERFIL EN UN VISTAZO", MARGIN + 12, y + 8);

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(summaryLines, MARGIN + 12, y + 14);

    y += cardH + 8;
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUESTIONS
  // ═══════════════════════════════════════════════════════════════════
  if (data.questions && data.questions.length > 0) {
    y = checkPageBreak(doc, y, 20);

    // Section header
    doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.roundedRect(MARGIN, y, CONTENT_W, 14, 3, 3, "F");

    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("?", MARGIN + 8, y + 9, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("TUS PREGUNTAS DE ACOMPANAMIENTO", MARGIN + 18, y + 7.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(`${data.questions.length} preguntas personalizadas`, MARGIN + 18, y + 12);

    y += 20;

    // ── Render each question card ──────────────────────────────────────
    for (let qi = 0; qi < data.questions.length; qi += 1) {
      const q = data.questions[qi];
      const chartLabel = CHART_LABELS[q.chart_ref] || q.chart_ref;
      const tier = q.confidence_tier || "moderate";

      // ── Calculate dynamic card height ────────────────────────────────

      // Wrap question text WITH CORRECT FONT: helvetica bold 9
      const qLines = wrapText(doc, `"${q.question_text}"`, Q_TEXT_W, "helvetica", "bold", 9);
      const qTextH = qLines.length * Q_LINE_SPACING;

      // Meta line (chart + type note): helvetica normal 7
      const metaStr = `Chart: ${chartLabel}  —  ${q.type_note}`;
      const metaLines = wrapText(doc, metaStr, Q_TEXT_W, "helvetica", "normal", 7);
      const metaH = metaLines.length * 3.8;

      // Source line (if any): helvetica italic 7
      const source = formatSource(q);
      let sourceH = 0;
      let sourceLines: string[] = [];
      if (source) {
        sourceLines = wrapText(doc, source, Q_TEXT_W, "helvetica", "italic", 7);
        sourceH = sourceLines.length * 3.8 + 3; // +3 for spacing above source
      }

      // Card layout constants
      const headerH = 13;        // "PREGUNTA N" row
      const spacingAfterQ = 2;   // space between question text and meta
      const spacingAfterMeta = 2; // space between meta and source

      const cardH = headerH + qTextH + spacingAfterQ + metaH + spacingAfterMeta + sourceH + 6;

      // Check page break FIRST — cardBottom must be calculated AFTER because y may change
      y = checkPageBreak(doc, y, cardH + 6);
      const cardBottom = y + cardH;

      // ── Draw card background ─────────────────────────────────────────
      doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 4, 4, "F");

      // Gold left bar
      doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
      doc.rect(MARGIN, y, Q_CARD_PAD_LEFT, cardH, "F");

      // ── Number circle ────────────────────────────────────────────────
      doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
      doc.circle(MARGIN + 12, y + 8.5, 5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(String(q.number), MARGIN + 12, y + 10.5, { align: "center" });

      // ── "PREGUNTA N" label ───────────────────────────────────────────
      doc.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text(`PREGUNTA ${q.number}`, MARGIN + 20, y + 8.5);

      // ── Confidence tier tag (top-right inside card) ──────────────────
      let tierBg: [number, number, number];
      let tierTextCol: [number, number, number];
      if (tier === "high") {
        tierBg = [236, 253, 245]; tierTextCol = [6, 95, 70];
      } else if (tier === "low") {
        tierBg = [254, 242, 242]; tierTextCol = [153, 27, 27];
      } else {
        tierBg = [255, 251, 235]; tierTextCol = [146, 64, 14];
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      const tagText = tier.toUpperCase();
      const tagW = doc.getTextWidth(tagText) + 10;
      const tagX = MARGIN + CONTENT_W - Q_CARD_PAD_RIGHT - tagW;
      doc.setFillColor(tierBg[0], tierBg[1], tierBg[2]);
      doc.roundedRect(tagX, y + 3, tagW, 6.5, 2, 2, "F");
      doc.setTextColor(tierTextCol[0], tierTextCol[1], tierTextCol[2]);
      doc.text(tagText, tagX + tagW / 2, y + 7, { align: "center" });

      // ── Question body ────────────────────────────────────────────────
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      let curY = drawLines(doc, qLines, Q_TEXT_X, y + headerH + 2, Q_LINE_SPACING);

      // ── Meta line ────────────────────────────────────────────────────
      curY += spacingAfterQ;
      doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      curY = drawLines(doc, metaLines, Q_TEXT_X, curY, 3.8);

      // ── Source line ──────────────────────────────────────────────────
      if (source) {
        curY += spacingAfterMeta;
        doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        drawLines(doc, sourceLines, Q_TEXT_X, curY, 3.8);
      }

      // ── Safety check: ensure card is tall enough ─────────────────────
      // (if lines were somehow more than calculated, pad a bit)
      const actualEnd = curY + 4;
      if (actualEnd > cardBottom) {
        // Re-draw card taller (rare edge case)
        doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
        doc.roundedRect(MARGIN, y, CONTENT_W, actualEnd - y, 4, 4, "F");
        doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
        doc.rect(MARGIN, y, Q_CARD_PAD_LEFT, actualEnd - y, "F");
        y = actualEnd + 6;
      } else {
        y = cardBottom + 8;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ONE THING WORTH NOTICING
  // ═══════════════════════════════════════════════════════════════════
  if (data.one_thing_worth_noticing) {
    y = checkPageBreak(doc, y, 28);

    // Section header
    doc.setFillColor(237, 233, 254);
    doc.circle(MARGIN + 6, y + 6, 6, "F");
    doc.setTextColor(124, 58, 237);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("O", MARGIN + 6, y + 8, { align: "center" });

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Algo que vale la pena notar", MARGIN + 18, y + 8);
    y += 22;

    const otLines = wrapText(doc, data.one_thing_worth_noticing, CONTENT_W - 14, "helvetica", "normal", 9);
    for (const line of otLines) {
      y = checkPageBreak(doc, y, 5);
      doc.text(`  ${line}`, MARGIN + 14, y);
      y += 5;
    }
    y += 8;
  }

  // ═══════════════════════════════════════════════════════════════════
  // COACHING NOTE
  // ═══════════════════════════════════════════════════════════════════
  if (data.coaching_note) {
    y = checkPageBreak(doc, y, 28);

    doc.setFillColor(209, 250, 229);
    doc.circle(MARGIN + 6, y + 6, 6, "F");
    doc.setTextColor(5, 150, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("C", MARGIN + 6, y + 8, { align: "center" });

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Si trabajas con un coach", MARGIN + 18, y + 8);
    y += 22;

    const cnText = `Lleva la pregunta que más te sorprendió. ${data.coaching_note}`;
    const cnLines = wrapText(doc, cnText, CONTENT_W - 14, "helvetica", "normal", 9);
    for (const line of cnLines) {
      y = checkPageBreak(doc, y, 5);
      doc.text(`  ${line}`, MARGIN + 14, y);
      y += 5;
    }
    y += 8;
  }

  // ═══════════════════════════════════════════════════════════════════
  // FINAL FOOTER + PAGE NUMBERS
  // ═══════════════════════════════════════════════════════════════════
  const fy = PAGE_H - 12;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, fy - 2, PAGE_W - MARGIN, fy - 2);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("MIA LUNA Type Companion Guide — Confidential", PAGE_W / 2, fy + 4, { align: "center" });

  addPageNumbers(doc);

  // ═══════════════════════════════════════════════════════════════════
  // DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════
  const safeName = profileName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "").trim() || "reporte";
  doc.save(`${safeName}_CompanionGuide.pdf`);
}