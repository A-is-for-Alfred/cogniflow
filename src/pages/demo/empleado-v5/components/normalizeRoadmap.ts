import type {
  RoadmapData,
  RoadmapObjective,
  ReaderProfile,
  RoadmapKpis,
  Milestone,
  FirstAction,
  Risk,
  IntegrityCheck,
} from "./roadmapTypes";

function normalizeFacet(f: any) {
  return {
    facet: f?.facet ?? "",
    pole: f?.dimension ?? f?.pole ?? "",
    score: Number(f?.score) || 0,
    zone: f?.status ?? f?.zone ?? "",
  };
}

function normalizeMilestones(raw: any): Milestone[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  return raw.map((m: any) => ({
    week: Number(m?.week) || 1,
    target_value: Number(m?.target_value) || 0,
    label: m?.label ?? "",
  }));
}

function normalizeFirstAction(raw: any): FirstAction | undefined {
  if (!raw) return undefined;
  const what = raw.action ?? raw.what;
  if (!what) return undefined;
  return {
    what: String(what),
    when: raw.date ?? raw.when,
    duration_min: raw.duration_minutes ?? raw.duration_min,
  };
}

function normalizeRisk(raw: any): Risk | undefined {
  if (!raw) return undefined;
  return {
    name: raw.name,
    early_warning: raw.early_warning,
    mitigation: raw.mitigation,
  };
}

function normalizeObjective(raw: any): RoadmapObjective {
  const smart = raw.smart || {};
  const measurable = smart.measurable;
  const scores = raw.scores || {};

  const measurableNorm = measurable
    ? {
        metric_name: measurable.metric_name,
        unit: measurable.unit,
        baseline: Number(measurable.baseline) || 0,
        target: Number(measurable.target) || 0,
        stretch:
          measurable.stretch != null ? Number(measurable.stretch) : null,
        direction: measurable.direction,
        formula: measurable.formula,
        collection: measurable.collection,
      }
    : undefined;

  return {
    order: Number(raw.order) || 0,
    title: raw.title ?? "",
    title_short: raw.title_short,
    path_type: raw.path_type,
    path_code: raw.path_code ?? raw.path,
    path_label: raw.path_label,
    mountain_type: raw.mountain_type,
    mountain_stage: raw.mountain_stage,
    source: raw.source,
    underlying_value_or_precondition: raw.underlying_value_or_precondition,
    value_base: raw.value_base,
    justification: raw.justification,
    rationale: raw.rationale,
    success_metric_infra: raw.success_metric_infra,
    smart:
      smart && Object.keys(smart).length > 0
        ? {
            specific: smart.specific,
            measurable: measurableNorm,
            achievable: smart.achievable,
            relevant: smart.relevant,
            time_bound: smart.time_bound,
          }
        : undefined,
    milestones: normalizeMilestones(smart.milestones ?? raw.milestones),
    scores: {
      desirability: scores.desirability,
      reachability: scores.reachability,
      friction: scores.friction,
      confidence: scores.confidence ?? undefined,
    },
    first_action: normalizeFirstAction(smart.first_action ?? raw.first_action),
    risk: normalizeRisk(smart.risk ?? raw.risk),
    dependencies: raw.dependencies,
    enables: raw.enables,
    progress: raw.progress,
    tags: raw.tags,
    visual: raw.visual,
  };
}

function normalizeReaderProfile(raw: any): ReaderProfile {
  const user = raw?.user || raw?.reader_profile || {};
  return {
    display_name: user.display_name ?? "",
    mbti_base: user.mbti_type ?? user.mbti_base ?? "",
    key_facets: Array.isArray(user.key_facets)
      ? user.key_facets.map(normalizeFacet)
      : undefined,
    core_values: Array.isArray(user.core_values) ? user.core_values : undefined,
    tension_patterns: Array.isArray(user.active_tensions)
      ? user.active_tensions
      : user.tension_patterns,
  };
}

function deriveKpis(
  raw: any,
  objectives: RoadmapObjective[],
): RoadmapKpis | undefined {
  if (raw?.roadmap_kpis) return raw.roadmap_kpis;
  if (objectives.length === 0) return undefined;

  const kpis: RoadmapKpis = {
    objectives_total: objectives.length,
    quick_wins: objectives.filter((o) => o.mountain_type === "Quick Win").length,
    summit: objectives.filter((o) => o.mountain_type === "The Summit").length,
  };

  const horizonDays = objectives.reduce(
    (max, o) => Math.max(max, o.smart?.time_bound?.horizon_days ?? 0),
    0,
  );
  if (horizonDays > 0) kpis.horizon_weeks = Math.ceil(horizonDays / 7);

  return kpis;
}

function normalizeIntegrityCheck(raw: any): IntegrityCheck[] | undefined {
  if (Array.isArray(raw)) return raw.length ? raw : undefined;
  if (!raw || typeof raw !== "object") return undefined;

  const checks: IntegrityCheck[] = [];
  if (raw.smart_completeness_pct != null) {
    checks.push({
      check: `SMART completeness ${raw.smart_completeness_pct}%`,
      status: raw.smart_completeness_pct >= 100 ? "pass" : "warn",
    });
  }
  if (raw.path_a_count != null || raw.path_b_count != null) {
    checks.push({
      check: `Path A=${raw.path_a_count ?? 0} · Path B=${raw.path_b_count ?? 0}`,
      status: "pass",
    });
  }
  return checks.length ? checks : undefined;
}

export function normalizeRoadmap(raw: any): RoadmapData {
  // Defensive: if raw is null/undefined, return empty but valid structure
  if (!raw || typeof raw !== "object") {
    console.warn("[normalizeRoadmap] Received null/undefined or non-object input:", raw);
    return {
      schema_version: "fallback",
      objectives: [],
      roadmap_summary: "",
    };
  }

  const objectives: RoadmapObjective[] = Array.isArray(raw.objectives)
    ? raw.objectives.map(normalizeObjective)
    : [];

  return {
    schema_version: raw.schema_version ?? "fallback",
    generated_at: raw.generated_at,
    locale: raw.locale,
    reader_profile: normalizeReaderProfile(raw),
    display_directives: raw.display_directives,
    roadmap_summary: raw.roadmap_summary ?? "",
    summary_blocks: raw.summary_blocks,
    summary_tts: raw.summary_tts,
    roadmap_kpis: deriveKpis(raw, objectives),
    scoring_model: raw.scoring_model,
    objectives,
    next_7_days: Array.isArray(raw.next_7_days) ? raw.next_7_days : undefined,
    integrity_check: normalizeIntegrityCheck(raw.integrity_check),
  };
}