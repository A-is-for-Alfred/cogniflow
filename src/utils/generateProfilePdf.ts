// ── Types ────────────────────────────────────────────────────────────────────
export interface TensionSource {
  tension_id?: string;
  tension_name?: string;
  tension_type?: string;
  facets?: string[];
}

export interface LeverSource {
  lever_id?: string;
  window_facet?: string;
  is_lead_window?: boolean;
  acts_on_facets?: string[];
  adjustment_direction?: string;
}

export interface ProfileQuestion {
  number: number;
  question_text: string;
  tension_source: TensionSource | null;
  lever_source: LeverSource | null;
  type_note: string;
  chart_ref: string;
  confidence_tier?: string;
}

export interface WebhookResponse {
  original_user_input?: string;
  decision?: string;
  understanding_summary?: string;
  coach_message?: string;
  enough_context_for_action?: boolean;
  profile_name?: string;
  mbti_type?: string;
  profile_summary?: string;
  reported_type?: string;
  individualized_type_label?: string;
  step1_scores?: Record<string, { direction?: string; clarity?: string; score?: number }>;
  polarity_index?: number;
  omitted_responses?: number;
  questions?: Array<Record<string, unknown>>;
  one_thing_worth_noticing?: string;
  coaching_note?: string;
  [key: string]: unknown;
}

export function isProfileResponse(json: WebhookResponse): boolean {
  return (
    typeof json.profile_name === "string" &&
    typeof json.mbti_type === "string" &&
    typeof json.profile_summary === "string" &&
    Array.isArray(json.questions)
  );
}