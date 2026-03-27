/**
 * Supabase client stub — Phase 3 foundation.
 *
 * TODO: Add these env vars to .env.local before enabling:
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 *
 * The stub returns safe no-ops so Phase 3 components render without
 * a live Supabase project. Replace with the real client when ready:
 *   npm install @supabase/supabase-js
 *   import { createClient } from "@supabase/supabase-js";
 *   export const supabase = createClient(url, key);
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ─── STUB ─────────────────────────────────────────────────────────────────────

type QueryResult<T> = Promise<{ data: T | null; error: { message: string } | null }>;

interface StubQuery {
  insert: (rows: unknown) => QueryResult<null>;
  select: (cols?: string) => StubSelectQuery;
}

interface StubSelectQuery extends QueryResult<unknown[]> {
  eq: (col: string, val: unknown) => StubSelectQuery;
  order: (col: string, opts?: { ascending?: boolean }) => StubSelectQuery;
}

function makeSelectQuery(): StubSelectQuery {
  const base = Promise.resolve({ data: [] as unknown[], error: null });
  const q: StubSelectQuery = Object.assign(base, {
    eq: (_col: string, _val: unknown) => makeSelectQuery(),
    order: (_col: string, _opts?: { ascending?: boolean }) => makeSelectQuery(),
  });
  return q;
}

function makeStubTable(): StubQuery {
  return {
    insert: async (_rows: unknown) => ({ data: null, error: null }),
    select: (_cols?: string) => makeSelectQuery(),
  };
}

interface StubSupabase {
  from: (table: string) => StubQuery;
  isStub: true;
}

const stub: StubSupabase = {
  isStub: true,
  from: (_table: string) => makeStubTable(),
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────

// When real env vars are present, this is where you'd swap in createClient().
// Until then, the stub keeps all dependent code renderable.
export const supabase: StubSupabase = stub;

export const SUPABASE_READY =
  typeof SUPABASE_URL === "string" &&
  SUPABASE_URL.length > 0 &&
  typeof SUPABASE_ANON_KEY === "string" &&
  SUPABASE_ANON_KEY.length > 0;
