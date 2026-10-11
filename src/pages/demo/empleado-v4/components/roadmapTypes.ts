export interface ReaderProfile {
  display_name: string;
  mbti_base: string;
  dominant_axes?: Record<string, string>;
  question_template_key?: string;
  key_facets?: Array<{
    facet: string;
    pole: string;
    score: number;
    zone: string;
  }>;
  midzones?: string[];
  tension_patterns?: string[];
  core_values?: string[];
}

export interface DisplayDirectives {
  reader_mode?: string;
  evidence_preference?: string;
  show_numbers_first?: boolean;
  collapse_narrative_by_default?: boolean;
  max_paragraph_chars?: number;
  primary_kpi_key?: string;
}

export interface SummaryBlocks {
  headline?: string;
  opening_hook?: string;
  profile_bridge?: string;
  mountain_thesis?: string;
  invitation?: string;
}

export interface SummaryTts {
  text?: string;
  estimated_seconds?: number;
}

export interface RoadmapKpis {
  objectives_total?: number;
  quick_wins?: number;
  summit?: number;
  horizon_weeks?: number;
  weekly_time_commitment_min?: number;
  data_points_per_week?: number;
  baseline_composite_pct?: number;
  target_composite_pct?: number;
  composite_formula?: string;
  start_date?: string;
  first_review_date?: string;
  summit_date?: string;
}

export interface ScoringModel {
  scale?: string;
  desirability_definition?: string;
  reachability_definition?: string;
  friction_definition?: string;
  ordering_rule?: string;
  weights?: Record<string, number>;
}

export interface MountainStage {
  camp?: string;
  altitude_pct?: number;
  label?: string;
}

export interface ObjectiveSource {
  origin?: string;
  verbatim_trigger?: string | null;
  reframe_from?: string | null;
  reframe_to?: string | null;
}

export interface ValueBase {
  value_name?: string;
  value_evidence?: string;
  precondition?: string;
  precondition_status?: string;
}

export interface RationaleMbtiEvidence {
  facet: string;
  score: number;
  zone: string;
  implication: string;
}

export interface RationaleMatrixReference {
  framework?: string;
  dimension?: string;
  behavior?: string;
}

export interface ObjectiveRationale {
  headline?: string;
  why_this_objective?: string;
  why_this_position?: string;
  mbti_evidence?: RationaleMbtiEvidence[];
  matrix_reference?: RationaleMatrixReference | null;
}

export interface ObjectiveCadence {
  question?: string;
  question_type_key?: string;
  frequency?: string;
  trigger_moment?: string;
  channel?: string;
  duration_min?: number;
}

export interface SmartMeasurable {
  metric_name?: string;
  unit?: string;
  baseline: number;
  target: number;
  stretch?: number | null;
  direction?: "up" | "down";
  formula?: string;
  collection?: string;
}

export interface SmartTimeBound {
  start_date?: string;
  review_date?: string;
  horizon_days?: number;
  checkpoints?: string[];
}

export interface Smart {
  specific?: string;
  measurable?: SmartMeasurable;
  achievable?: string;
  relevant?: string;
  time_bound?: SmartTimeBound;
}

export interface Milestone {
  week: number;
  target_value: number;
  label: string;
}

export interface ObjectiveScores {
  desirability?: number;
  reachability?: number;
  friction?: number;
  confidence?: string;
}

export interface FirstAction {
  what?: string;
  when?: string;
  duration_min?: number;
}

export interface Risk {
  name?: string;
  early_warning?: string;
  mitigation?: string;
}

export interface ObjectiveProgress {
  current_value?: number;
  current_pct?: number;
  status?: string;
  last_updated?: string | null;
}

export interface ObjectiveVisual {
  icon?: string;
  accent_role?: string;
  emphasis?: string;
}

export interface RoadmapObjective {
  order: number;
  title: string;
  title_short?: string;
  path_type?: string;
  path_code?: "A" | "B" | string;
  path_label?: string;
  mountain_type?: string;
  mountain_stage?: MountainStage;
  source?: ObjectiveSource;
  underlying_value_or_precondition?: string;
  value_base?: ValueBase | null;
  justification?: string;
  rationale?: ObjectiveRationale;
  cadence_check?: string;
  cadence?: ObjectiveCadence;
  success_metric_infra?: string;
  smart?: Smart;
  milestones?: Milestone[];
  scores?: ObjectiveScores;
  first_action?: FirstAction;
  risk?: Risk;
  dependencies?: number[];
  enables?: number[];
  progress?: ObjectiveProgress;
  tags?: string[];
  visual?: ObjectiveVisual;
}

export interface Next7DayItem {
  day?: number;
  weekday?: string;
  focus_objective?: number;
  task?: string;
  duration_min?: number;
  channel?: string;
}

export interface IntegrityCheck {
  check?: string;
  status?: "pass" | "warn" | "fail";
  detail?: string;
}

export interface RoadmapData {
  schema_version?: string;
  generated_at?: string;
  locale?: string;
  reader_profile?: ReaderProfile;
  display_directives?: DisplayDirectives;
  roadmap_summary?: string;
  summary_blocks?: SummaryBlocks;
  summary_tts?: SummaryTts;
  roadmap_kpis?: RoadmapKpis;
  scoring_model?: ScoringModel;
  objectives: RoadmapObjective[];
  next_7_days?: Next7DayItem[];
  integrity_check?: IntegrityCheck[];
}