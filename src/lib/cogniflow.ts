import { supabase as backend, getSafeSession } from "@/lib/supabase";

export { getSafeSession };

/**
 * v4 data client.
 *
 * `.from()` routes all table CRUD through the `cogniflow-crud` edge function,
 * which talks to the external PostgreSQL database (`cogniflow` at 72.61.2.50).
 * Auth, Functions and Storage remain on Readdy Backend (delegated below).
 *
 * It is intentionally exported as `supabase` so the v4 components are a
 * drop-in copy of v3 — only the import path changes.
 */

type CrudOperation = "select" | "insert" | "update" | "delete";

interface CrudRequest {
  operation: CrudOperation;
  table: string;
  columns?: string;
  data?: Record<string, unknown> | Record<string, unknown>[];
  match?: Record<string, unknown>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
  maybeSingle?: boolean;
  count?: "exact";
  head?: boolean;
}

async function invokeCrud(
  req: CrudRequest,
): Promise<{ data: unknown; error: { message: string } | null }> {
  let data: unknown = null;
  let err: { message?: string; context?: unknown } | null = null;
  try {
    const res = await backend.functions.invoke("cogniflow-crud", {
      body: req as unknown as Record<string, unknown>,
    });
    data = res.data;
    err = res.error as { message?: string; context?: unknown } | null;
  } catch (e) {
    return {
      data: null,
      error: { message: e instanceof Error ? e.message : String(e) },
    };
  }

  if (err) {
    let msg = err.message || String(err);
    try {
      const ctx = err.context;
      const bodyStr =
        typeof ctx === "string"
          ? ctx
          : (ctx as { body?: unknown } | undefined)?.body;
      if (typeof bodyStr === "string") {
        const parsed = JSON.parse(bodyStr);
        if (parsed?.error) msg = parsed.error;
      }
    } catch {
      /* keep generic message */
    }
    return { data: null, error: { message: msg } };
  }

  const payload = data as { data?: unknown; error?: string | null } | null;
  if (!payload) return { data: null, error: { message: "Empty response from backend" } };
  if (payload.error) return { data: null, error: { message: payload.error } };
  return { data: payload.data, error: null };
}

class CogniflowQueryBuilder {
  private table: string;
  private operation: CrudOperation | null = null;
  private columns = "*";
  private match: Record<string, unknown> = {};
  private orderBy?: { column: string; ascending?: boolean };
  private limitBy?: number;
  private singleFlag = false;
  private maybeSingleFlag = false;
  private countFlag?: "exact";
  private headFlag = false;
  private payload?: Record<string, unknown> | Record<string, unknown>[];

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, options?: { count?: "exact"; head?: boolean }): this {
    if (columns != null) this.columns = columns;
    if (options?.count) this.countFlag = options.count;
    if (options?.head) this.headFlag = options.head;
    if (!this.operation) this.operation = "select";
    return this;
  }

  insert(data: Record<string, unknown> | Record<string, unknown>[]): this {
    this.operation = "insert";
    this.payload = data;
    return this;
  }

  update(data: Record<string, unknown>): this {
    this.operation = "update";
    this.payload = data;
    return this;
  }

  delete(): this {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: unknown): this {
    this.match[column] = value;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(n: number): this {
    this.limitBy = n;
    return this;
  }

  single(): this {
    this.singleFlag = true;
    return this;
  }

  maybeSingle(): this {
    this.maybeSingleFlag = true;
    return this;
  }

  then(onfulfilled?: any, onrejected?: any): Promise<any> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<any> {
    const req: CrudRequest = {
      operation: this.operation ?? "select",
      table: this.table,
      columns: this.columns,
      match: Object.keys(this.match).length ? this.match : undefined,
      order: this.orderBy,
      limit: this.limitBy,
      single: this.singleFlag,
      maybeSingle: this.maybeSingleFlag,
      count: this.countFlag,
      head: this.headFlag,
      data: this.payload,
    };

    const result = await invokeCrud(req);
    if (result.error) return result;

    if (this.countFlag === "exact" && this.headFlag) {
      return { count: (result.data as number) ?? 0, data: [], error: null };
    }

    if (this.singleFlag || this.maybeSingleFlag) {
      const d = Array.isArray(result.data)
        ? result.data[0] ?? null
        : result.data;
      return { data: d, error: null };
    }

    return result;
  }
}

/** Idempotent schema migration against the external Postgres. */
export async function runMigrations(): Promise<boolean> {
  try {
    const { error } = await backend.functions.invoke("cogniflow-migrate", { body: {} });
    return !error;
  } catch {
    return false;
  }
}

export const supabase = {
  from: (table: string) => new CogniflowQueryBuilder(table),
  auth: backend.auth,
  functions: backend.functions,
  storage: backend.storage,
};