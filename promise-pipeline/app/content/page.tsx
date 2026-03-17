"use client";

import { useReducer, useEffect, useCallback, useRef, useState } from "react";

// ─── TYPES ───

interface ContentPost {
  postNumber: number;
  postType:
    | "announcement"
    | "headline_finding"
    | "verification_gap"
    | "methodology"
    | "provocation"
    | "data_point"
    | "cta";
  scheduledDay: number;
  platforms: {
    linkedin?: string;
    twitter?: string | string[];
    bluesky?: string;
  };
  hook: string;
  internalNotes: string;
  suggestedImage: string;
  status: "pending" | "approved" | "rejected" | "edited";
  edits: Partial<ContentPost["platforms"]>;
}

interface ArticleMeta {
  title: string;
  vertical: string;
  graphUrl?: string;
  blogUrl?: string;
  slug: string;
}

interface PostizIntegration {
  id: string;
  name: string;
  identifier: string;
  picture?: string;
  disabled?: boolean;
}

interface PushResult {
  postNumber: number;
  platform: string;
  success: boolean;
  postizPostId?: string;
  error?: string;
}

interface SanityPost {
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  vertical?: string;
  categories?: string[];
}

type ContentPhase =
  | "select"
  | "generating"
  | "reviewing"
  | "pushing"
  | "complete"
  | "error";

interface ContentState {
  phase: ContentPhase;
  article: ArticleMeta | null;
  articleBody: string;
  series: ContentPost[];
  currentIndex: number;
  activePlatform: "linkedin" | "twitter" | "bluesky";
  integrations: PostizIntegration[];
  selectedIntegrations: Record<string, string>;
  publicationDate: string;
  generationError: { type: "parse_failed"; rawText: string } | null;
  pushResults: PushResult[] | null;
  retryCount: number;
}

type ContentAction =
  | { type: "ARTICLE_LOADED"; article: ArticleMeta; body: string }
  | { type: "GENERATION_COMPLETE"; series: ContentPost[] }
  | {
      type: "GENERATION_FAILED";
      error: { type: "parse_failed"; rawText: string };
    }
  | { type: "SWITCH_PLATFORM"; platform: "linkedin" | "twitter" | "bluesky" }
  | {
      type: "EDIT_CONTENT";
      postNumber: number;
      platform: string;
      content: string;
    }
  | { type: "EDIT_SCHEDULE"; postNumber: number; day: number }
  | { type: "APPROVE"; postNumber: number }
  | { type: "REJECT"; postNumber: number }
  | { type: "PREVIOUS" }
  | { type: "NEXT" }
  | { type: "PUSH_STARTED" }
  | { type: "PUSH_COMPLETE"; results: PushResult[] }
  | { type: "PUSH_FAILED"; error: string }
  | { type: "SET_PUBLICATION_DATE"; date: string }
  | { type: "SET_INTEGRATIONS"; integrations: Record<string, string> }
  | { type: "LOAD_INTEGRATIONS"; integrations: PostizIntegration[] }
  | { type: "START_GENERATING" }
  | { type: "INCREMENT_RETRY" }
  | { type: "RESET" };

// ─── CONSTANTS ───

const PLATFORM_LIMITS: Record<string, number> = {
  linkedin: 1300,
  twitter: 280,
  bluesky: 300,
};

const POST_TYPE_COLORS: Record<string, string> = {
  announcement: "#1e40af",
  headline_finding: "#1a5f4a",
  verification_gap: "#991b1b",
  methodology: "#5b21b6",
  provocation: "#78350f",
  data_point: "#1e40af",
  cta: "#1a5f4a",
};

const POST_TYPE_LABELS: Record<string, string> = {
  announcement: "Announcement",
  headline_finding: "Headline Finding",
  verification_gap: "Verification Gap",
  methodology: "Methodology",
  provocation: "Provocation",
  data_point: "Data Point",
  cta: "CTA",
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  twitter: "#1f2937",
  bluesky: "#0085FF",
};

const VERTICALS = [
  "Civic",
  "AI Safety",
  "Infrastructure",
  "Supply Chain",
  "Teams",
  "General",
];

const DEMO_GRAPHS = [
  { label: "HB 2021", url: "/demo/hb2021" },
  { label: "ACA", url: "/demo/aca" },
  { label: "AI Safety", url: "/demo/ai" },
  { label: "Infrastructure", url: "/demo/infrastructure" },
  { label: "Supply Chain", url: "/demo/supply-chain" },
];

// ─── REDUCER ───

const initialState: ContentState = {
  phase: "select",
  article: null,
  articleBody: "",
  series: [],
  currentIndex: 0,
  activePlatform: "linkedin",
  integrations: [],
  selectedIntegrations: {},
  publicationDate: new Date().toISOString().split("T")[0],
  generationError: null,
  pushResults: null,
  retryCount: 0,
};

function reducer(state: ContentState, action: ContentAction): ContentState {
  switch (action.type) {
    case "ARTICLE_LOADED":
      return {
        ...state,
        article: action.article,
        articleBody: action.body,
      };
    case "START_GENERATING":
      return { ...state, phase: "generating" };
    case "GENERATION_COMPLETE": {
      const series = action.series.map((post) => ({
        ...post,
        status: "pending" as const,
        edits: {},
      }));
      return {
        ...state,
        phase: "reviewing",
        series,
        currentIndex: 0,
        retryCount: 0,
        generationError: null,
      };
    }
    case "GENERATION_FAILED":
      return {
        ...state,
        phase: "error",
        generationError: action.error,
      };
    case "SWITCH_PLATFORM":
      return { ...state, activePlatform: action.platform };
    case "EDIT_CONTENT": {
      const series = state.series.map((post) => {
        if (post.postNumber !== action.postNumber) return post;
        return {
          ...post,
          status: "edited" as const,
          edits: { ...post.edits, [action.platform]: action.content },
        };
      });
      return { ...state, series };
    }
    case "EDIT_SCHEDULE": {
      const series = state.series.map((post) =>
        post.postNumber === action.postNumber
          ? { ...post, scheduledDay: action.day }
          : post
      );
      return { ...state, series };
    }
    case "APPROVE": {
      const series = state.series.map((post) =>
        post.postNumber === action.postNumber
          ? { ...post, status: "approved" as const }
          : post
      );
      const nextIndex = Math.min(state.currentIndex + 1, series.length - 1);
      return { ...state, series, currentIndex: nextIndex };
    }
    case "REJECT": {
      const series = state.series.map((post) =>
        post.postNumber === action.postNumber
          ? { ...post, status: "rejected" as const }
          : post
      );
      const nextIndex = Math.min(state.currentIndex + 1, series.length - 1);
      return { ...state, series, currentIndex: nextIndex };
    }
    case "PREVIOUS":
      return {
        ...state,
        currentIndex: Math.max(0, state.currentIndex - 1),
      };
    case "NEXT":
      return {
        ...state,
        currentIndex: Math.min(
          state.series.length - 1,
          state.currentIndex + 1
        ),
      };
    case "PUSH_STARTED":
      return { ...state, phase: "pushing" };
    case "PUSH_COMPLETE":
      return { ...state, phase: "complete", pushResults: action.results };
    case "PUSH_FAILED":
      return { ...state, phase: "reviewing" };
    case "SET_PUBLICATION_DATE":
      return { ...state, publicationDate: action.date };
    case "SET_INTEGRATIONS":
      return { ...state, selectedIntegrations: action.integrations };
    case "LOAD_INTEGRATIONS":
      return { ...state, integrations: action.integrations };
    case "INCREMENT_RETRY":
      return { ...state, retryCount: state.retryCount + 1 };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ─── LOCAL STORAGE HELPERS ───

function saveToLocalStorage(slug: string, state: ContentState) {
  try {
    const key = `contentTool:series:${slug}`;
    const data = {
      article: state.article,
      series: state.series,
      publicationDate: state.publicationDate,
      selectedIntegrations: state.selectedIntegrations,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

function loadIntegrationsFromStorage(): Record<string, string> {
  try {
    const raw = localStorage.getItem("contentTool:integrations");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveIntegrationsToStorage(integrations: Record<string, string>) {
  try {
    localStorage.setItem(
      "contentTool:integrations",
      JSON.stringify(integrations)
    );
  } catch {
    // ignore
  }
}

// ─── MAIN COMPONENT ───

export default function ContentPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load Postiz integrations on mount
  useEffect(() => {
    const saved = loadIntegrationsFromStorage();
    if (Object.keys(saved).length > 0) {
      dispatch({ type: "SET_INTEGRATIONS", integrations: saved });
    }

    fetch("/api/content/integrations")
      .then((r) => {
        if (r.ok) return r.json();
        return [];
      })
      .then((data) => {
        if (Array.isArray(data)) {
          dispatch({ type: "LOAD_INTEGRATIONS", integrations: data });
        }
      })
      .catch(() => {});
  }, []);

  // Auto-save on series changes
  useEffect(() => {
    if (state.article?.slug && state.series.length > 0) {
      saveToLocalStorage(state.article.slug, state);
    }
  }, [state.series, state.article, state.publicationDate, state.selectedIntegrations]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Content Marketing Pipeline
          </h1>
          <p className="text-sm text-gray-500">
            Transform articles into platform-specific social media series.
          </p>
        </div>

        {state.phase === "select" && (
          <SelectPhase state={state} dispatch={dispatch} />
        )}
        {state.phase === "generating" && (
          <GeneratingPhase state={state} />
        )}
        {state.phase === "reviewing" && (
          <ReviewPhase state={state} dispatch={dispatch} />
        )}
        {state.phase === "pushing" && <PushingPhase />}
        {state.phase === "complete" && (
          <CompletePhase state={state} dispatch={dispatch} />
        )}
        {state.phase === "error" && (
          <ErrorPhase state={state} dispatch={dispatch} />
        )}
      </div>
    </div>
  );
}

// ─── PHASE 1: CONTENT SOURCE SELECTION ───

function SelectPhase({
  state,
  dispatch,
}: {
  state: ContentState;
  dispatch: React.Dispatch<ContentAction>;
}) {
  const [sanityPosts, setSanityPosts] = useState<SanityPost[]>([]);
  const [sanityLoading, setSanityLoading] = useState(false);
  const [sanityError, setSanityError] = useState("");

  // Manual paste fields
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [vertical, setVertical] = useState("General");
  const [graphRef, setGraphRef] = useState("");
  const [customGraphUrl, setCustomGraphUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");

  // Sanity fields
  const [selectedSlug, setSelectedSlug] = useState("");

  // Load Sanity posts on mount
  useEffect(() => {
    setSanityLoading(true);
    fetch(
      `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cwvex1ty"}.api.sanity.io/v2024-01-01/data/query/${process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}?query=${encodeURIComponent('*[_type == "post"] | order(publishedAt desc) { title, slug, excerpt, publishedAt, vertical }')}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.result) {
          setSanityPosts(data.result);
        } else {
          setSanityError("No blog posts found. Use manual paste below.");
        }
      })
      .catch(() => {
        setSanityError("No blog posts found. Use manual paste below.");
      })
      .finally(() => setSanityLoading(false));
  }, []);

  const getGraphUrl = () => {
    if (graphRef === "custom") return customGraphUrl;
    if (graphRef) return graphRef;
    return undefined;
  };

  const handleSanitySelect = async () => {
    const post = sanityPosts.find((p) => p.slug?.current === selectedSlug);
    if (!post) return;

    // Fetch full post body
    try {
      const query = `*[_type == "post" && slug.current == "${selectedSlug}"][0] { title, slug, body, vertical }`;
      const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cwvex1ty"}.api.sanity.io/v2024-01-01/data/query/${process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data?.result?.body) {
        // Convert Portable Text to plain text
        const plainText = portableTextToPlain(data.result.body);
        const article: ArticleMeta = {
          title: post.title,
          vertical: post.vertical || "General",
          graphUrl: getGraphUrl(),
          blogUrl: blogUrl || `/blog/${selectedSlug}`,
          slug: selectedSlug,
        };
        dispatch({ type: "ARTICLE_LOADED", article, body: plainText });
        triggerGeneration(article, plainText, dispatch);
      }
    } catch {
      setSanityError("Failed to fetch post body.");
    }
  };

  const handleManualSubmit = () => {
    if (!body.trim() || !title.trim()) return;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 50);
    const article: ArticleMeta = {
      title,
      vertical,
      graphUrl: getGraphUrl(),
      blogUrl: blogUrl || undefined,
      slug,
    };
    dispatch({ type: "ARTICLE_LOADED", article, body });
    triggerGeneration(article, body, dispatch);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mode A: Pull from Sanity */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">
          Pull from Blog
        </h2>

        {sanityLoading && (
          <p className="text-sm text-gray-500">Loading blog posts...</p>
        )}

        {sanityError && !sanityLoading && (
          <p className="text-sm text-gray-400">{sanityError}</p>
        )}

        {sanityPosts.length > 0 && (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="sanity-post"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select a published post
              </label>
              <select
                id="sanity-post"
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <option value="">Choose a post...</option>
                {sanityPosts.map((post) => (
                  <option key={post.slug?.current} value={post.slug?.current}>
                    {post.title}
                    {post.publishedAt
                      ? ` — ${new Date(post.publishedAt).toLocaleDateString()}`
                      : ""}
                    {post.vertical ? ` [${post.vertical}]` : ""}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSanitySelect}
              disabled={!selectedSlug}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Load & Generate
            </button>
          </div>
        )}
      </div>

      {/* Mode B: Manual Paste */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">
          Manual Paste
        </h2>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="article-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Article title
            </label>
            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              placeholder="e.g., Oregon HB 2021: 20 Promises, 5 Years Later"
            />
          </div>
          <div>
            <label
              htmlFor="article-body"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Article body
            </label>
            <textarea
              id="article-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-y focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              rows={10}
              placeholder="Paste the full text of your pillar article here..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="vertical-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vertical
              </label>
              <select
                id="vertical-select"
                value={vertical}
                onChange={(e) => setVertical(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="blog-url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Blog URL (optional)
              </label>
              <input
                id="blog-url"
                type="text"
                value={blogUrl}
                onChange={(e) => setBlogUrl(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                placeholder="/blog/article-slug"
              />
            </div>
          </div>
          <button
            onClick={handleManualSubmit}
            disabled={!title.trim() || !body.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Generate Content Series
          </button>
        </div>
      </div>

      {/* Promise Graph Reference */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">
          Promise Graph Reference (Optional)
        </h2>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="graph-ref"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dashboard link for CTAs
            </label>
            <select
              id="graph-ref"
              value={graphRef}
              onChange={(e) => setGraphRef(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <option value="">None</option>
              {DEMO_GRAPHS.map((g) => (
                <option key={g.url} value={g.url}>
                  {g.label} ({g.url})
                </option>
              ))}
              <option value="custom">Custom URL</option>
            </select>
          </div>
          {graphRef === "custom" && (
            <div>
              <label
                htmlFor="custom-graph-url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Custom graph URL
              </label>
              <input
                id="custom-graph-url"
                type="text"
                value={customGraphUrl}
                onChange={(e) => setCustomGraphUrl(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                placeholder="/demo/my-graph"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GENERATION TRIGGER ───

async function triggerGeneration(
  article: ArticleMeta,
  body: string,
  dispatch: React.Dispatch<ContentAction>
) {
  dispatch({ type: "START_GENERATING" });

  try {
    const response = await fetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: article.title,
        body,
        vertical: article.vertical,
        graphUrl: article.graphUrl,
        blogUrl: article.blogUrl,
      }),
    });

    const data = await response.json();

    if (data.error === "parse_failed") {
      dispatch({
        type: "GENERATION_FAILED",
        error: { type: "parse_failed", rawText: data.rawText || "" },
      });
    } else if (data.series) {
      dispatch({ type: "GENERATION_COMPLETE", series: data.series });
    } else {
      dispatch({
        type: "GENERATION_FAILED",
        error: {
          type: "parse_failed",
          rawText: JSON.stringify(data),
        },
      });
    }
  } catch (error) {
    dispatch({
      type: "GENERATION_FAILED",
      error: {
        type: "parse_failed",
        rawText: String(error),
      },
    });
  }
}

// ─── PORTABLE TEXT HELPER ───

function portableTextToPlain(blocks: any[]): string {
  if (!Array.isArray(blocks)) return String(blocks || "");
  return blocks
    .map((block: any) => {
      if (block._type !== "block" || !block.children) return "";
      return block.children.map((child: any) => child.text || "").join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

// ─── GENERATING PHASE ───

function GeneratingPhase({ state }: { state: ContentState }) {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="animate-pulse mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
      <h2 className="font-serif text-xl font-semibold text-gray-900 mb-2">
        Generating content series...
      </h2>
      <p className="text-sm text-gray-500">
        Generating content series from &ldquo;
        {state.article?.title || "article"}&rdquo;
      </p>
    </div>
  );
}

// ─── ERROR PHASE ───

function ErrorPhase({
  state,
  dispatch,
}: {
  state: ContentState;
  dispatch: React.Dispatch<ContentAction>;
}) {
  const [editedRaw, setEditedRaw] = useState(
    state.generationError?.rawText || ""
  );

  const retry = () => {
    if (state.retryCount >= 2) return;
    dispatch({ type: "INCREMENT_RETRY" });
    if (state.article && state.articleBody) {
      triggerGeneration(state.article, state.articleBody, dispatch);
    }
  };

  const parseManually = () => {
    try {
      const clean = editedRaw.replace(/```json|```/g, "").trim();
      const series = JSON.parse(clean);
      if (Array.isArray(series)) {
        dispatch({ type: "GENERATION_COMPLETE", series });
      }
    } catch {
      alert("Invalid JSON. Please fix and try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="font-serif text-lg font-semibold text-red-900 mb-2">
          Generation Failed
        </h2>
        <p className="text-sm text-red-700 mb-4">
          Claude returned a response that couldn&apos;t be parsed.
          {state.retryCount < 2
            ? " You can retry or view the raw response."
            : " Edit the raw response below to fix the JSON."}
        </p>

        <div className="flex gap-2 mb-4">
          {state.retryCount < 2 && (
            <button
              onClick={retry}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Retry ({2 - state.retryCount} left)
            </button>
          )}
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Start Over
          </button>
        </div>

        <div>
          <label
            htmlFor="raw-response"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Raw response{state.retryCount >= 2 ? " (editable)" : ""}
          </label>
          <textarea
            id="raw-response"
            value={editedRaw}
            onChange={(e) => setEditedRaw(e.target.value)}
            readOnly={state.retryCount < 2}
            className="w-full border rounded-lg px-3 py-2 text-xs font-mono h-48 resize-y focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          />
          {state.retryCount >= 2 && (
            <button
              onClick={parseManually}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Parse Edited JSON
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PHASE 3: CARD-BY-CARD REVIEW ───

function ReviewPhase({
  state,
  dispatch,
}: {
  state: ContentState;
  dispatch: React.Dispatch<ContentAction>;
}) {
  const post = state.series[state.currentIndex];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showChannelConfig, setShowChannelConfig] = useState(false);
  const [showPushDialog, setShowPushDialog] = useState(false);

  const approvedCount = state.series.filter(
    (p) => p.status === "approved"
  ).length;
  const editedCount = state.series.filter(
    (p) => p.status === "edited"
  ).length;
  const rejectedCount = state.series.filter(
    (p) => p.status === "rejected"
  ).length;
  const pendingCount = state.series.filter(
    (p) => p.status === "pending"
  ).length;

  // Get current platform content
  const getPlatformContent = useCallback(
    (p: ContentPost, platform: string): string => {
      const edited = (p.edits as Record<string, string>)?.[platform];
      if (edited !== undefined) return edited;
      const original = (p.platforms as Record<string, string | string[]>)?.[
        platform
      ];
      if (Array.isArray(original)) return original.join("\n\n---\n\n");
      return (original as string) || "";
    },
    []
  );

  const currentContent = post
    ? getPlatformContent(post, state.activePlatform)
    : "";
  const charLimit = PLATFORM_LIMITS[state.activePlatform] || 1300;
  const charCount = currentContent.length;
  const charWarning = charCount > charLimit * 0.9;
  const charOver = charCount > charLimit;

  // Platform indicator
  const getPlatformIndicator = useCallback(
    (p: ContentPost, platform: string) => {
      const content = getPlatformContent(p, platform);
      if (!content) return "gray";
      if (p.status === "approved") return "green";
      if (p.status === "rejected") return "red";
      return "amber";
    },
    [getPlatformContent]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
        return;

      switch (e.key.toLowerCase()) {
        case "a":
          if (post) dispatch({ type: "APPROVE", postNumber: post.postNumber });
          break;
        case "r":
          if (post) dispatch({ type: "REJECT", postNumber: post.postNumber });
          break;
        case "arrowleft":
          dispatch({ type: "PREVIOUS" });
          break;
        case "arrowright":
          dispatch({ type: "NEXT" });
          break;
        case "1":
          dispatch({ type: "SWITCH_PLATFORM", platform: "linkedin" });
          break;
        case "2":
          dispatch({ type: "SWITCH_PLATFORM", platform: "twitter" });
          break;
        case "3":
          dispatch({ type: "SWITCH_PLATFORM", platform: "bluesky" });
          break;
        case "e":
          textareaRef.current?.focus();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [post, dispatch]);

  // Auto-resize textarea
  const handleContentEdit = (value: string) => {
    if (!post) return;
    dispatch({
      type: "EDIT_CONTENT",
      postNumber: post.postNumber,
      platform: state.activePlatform,
      content: value,
    });
  };

  if (!post) return null;

  const postTypeColor = POST_TYPE_COLORS[post.postType] || "#1f2937";

  return (
    <div>
      {/* Progress header */}
      <div className="bg-white border-b px-4 py-3 mb-6 -mx-4 sm:-mx-6 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              Content Series: &ldquo;{state.article?.title}&rdquo;
            </span>
            <span className="text-gray-400 ml-4">
              Post {state.currentIndex + 1} of {state.series.length}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="text-green-700">{approvedCount} approved</span>
            <span style={{ color: "#78350f" }}>{editedCount} edited</span>
            <span className="text-red-700">{rejectedCount} rejected</span>
            <span className="text-gray-500">{pendingCount} pending</span>
            <button
              onClick={() => setShowChannelConfig(!showChannelConfig)}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Channels
            </button>
            <button
              onClick={() => setShowPushDialog(true)}
              disabled={approvedCount + editedCount === 0}
              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Push to Postiz
            </button>
            <ExportButton state={state} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-1">
          <div className="flex gap-1">
            {state.series.map((p, i) => (
              <button
                key={p.postNumber}
                onClick={() =>
                  dispatch({
                    type: i < state.currentIndex ? "PREVIOUS" : "NEXT",
                  })
                }
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === state.currentIndex
                    ? "bg-blue-600"
                    : p.status === "approved"
                    ? "bg-green-500"
                    : p.status === "rejected"
                    ? "bg-red-400"
                    : p.status === "edited"
                    ? "bg-amber-400"
                    : "bg-gray-200"
                }`}
                aria-label={`Go to post ${p.postNumber}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Channel Configuration */}
      {showChannelConfig && (
        <ChannelConfigPanel state={state} dispatch={dispatch} />
      )}

      {/* Push Dialog */}
      {showPushDialog && (
        <PushDialog
          state={state}
          dispatch={dispatch}
          onClose={() => setShowPushDialog(false)}
        />
      )}

      {/* Card */}
      <div
        className="bg-white rounded-xl border p-5 transition-all"
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: postTypeColor,
        }}
      >
        {/* Card header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">
              Post {post.postNumber} of {state.series.length}
            </span>
            <span className="text-xs text-gray-400">&mdash;</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                color: postTypeColor,
                backgroundColor: postTypeColor + "15",
              }}
            >
              {POST_TYPE_LABELS[post.postType] || post.postType}
            </span>
            <StatusIndicator status={post.status} />
          </div>
          <span className="text-xs text-gray-500">
            Day {post.scheduledDay}
          </span>
        </div>

        {/* Platform tabs */}
        <div className="flex gap-1 mb-4 border-b" role="tablist">
          {(["linkedin", "twitter", "bluesky"] as const).map((platform) => {
            const indicator = getPlatformIndicator(post, platform);
            const isActive = state.activePlatform === platform;
            const labels: Record<string, string> = {
              linkedin: "LinkedIn",
              twitter: "X",
              bluesky: "Bluesky",
            };
            return (
              <button
                key={platform}
                role="tab"
                aria-selected={isActive}
                onClick={() =>
                  dispatch({ type: "SWITCH_PLATFORM", platform })
                }
                className={`px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  isActive
                    ? "border-b-2 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={
                  isActive
                    ? { borderBottomColor: PLATFORM_COLORS[platform] }
                    : undefined
                }
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        indicator === "green"
                          ? "#1a5f4a"
                          : indicator === "amber"
                          ? "#b45309"
                          : indicator === "red"
                          ? "#991b1b"
                          : "#d1d5db",
                    }}
                  />
                  {labels[platform]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content textarea */}
        <div className="mb-4">
          <label htmlFor="post-content" className="sr-only">
            Post content for {state.activePlatform}
          </label>
          <textarea
            id="post-content"
            ref={textareaRef}
            value={currentContent}
            onChange={(e) => handleContentEdit(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-y min-h-[120px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            rows={8}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs font-medium text-gray-900">
              Hook: <span className="font-normal">{post.hook}</span>
            </p>
            <span
              className="text-xs font-mono"
              style={{
                color: charOver
                  ? "#991b1b"
                  : charWarning
                  ? "#78350f"
                  : "#4b5563",
              }}
            >
              {charCount} / {charLimit}
            </span>
          </div>
        </div>

        {/* Metadata panel */}
        <details className="mb-4" open>
          <summary className="text-xs font-medium text-gray-500 cursor-pointer mb-2">
            Post details
          </summary>
          <div className="space-y-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <div>
              <span className="font-medium text-gray-700">
                Internal notes:
              </span>{" "}
              {post.internalNotes}
            </div>
            <div>
              <span className="font-medium text-gray-700">
                Suggested image:
              </span>{" "}
              {post.suggestedImage}
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor={`schedule-day-${post.postNumber}`}
                className="font-medium text-gray-700"
              >
                Scheduled day:
              </label>
              <input
                id={`schedule-day-${post.postNumber}`}
                type="number"
                value={post.scheduledDay}
                onChange={(e) =>
                  dispatch({
                    type: "EDIT_SCHEDULE",
                    postNumber: post.postNumber,
                    day: parseInt(e.target.value) || 0,
                  })
                }
                className="w-16 border rounded px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                min={0}
              />
            </div>
          </div>
        </details>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={() => dispatch({ type: "PREVIOUS" })}
            disabled={state.currentIndex === 0}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            &larr; Previous
          </button>
          <div className="flex gap-2">
            <button
              onClick={() =>
                dispatch({ type: "REJECT", postNumber: post.postNumber })
              }
              className="px-4 py-2 text-sm border border-red-200 text-red-700 rounded-lg hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Reject
            </button>
            <button
              onClick={() =>
                dispatch({ type: "APPROVE", postNumber: post.postNumber })
              }
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Approve &rarr;
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          <kbd className="px-1 py-0.5 border rounded text-xs">A</kbd> approve{" "}
          <kbd className="px-1 py-0.5 border rounded text-xs">R</kbd> reject{" "}
          <kbd className="px-1 py-0.5 border rounded text-xs">E</kbd> edit{" "}
          <kbd className="px-1 py-0.5 border rounded text-xs">&larr;</kbd>
          <kbd className="px-1 py-0.5 border rounded text-xs">&rarr;</kbd> nav{" "}
          <kbd className="px-1 py-0.5 border rounded text-xs">1</kbd>
          <kbd className="px-1 py-0.5 border rounded text-xs">2</kbd>
          <kbd className="px-1 py-0.5 border rounded text-xs">3</kbd> platform
        </p>
      </div>
    </div>
  );
}

// ─── STATUS INDICATOR ───

function StatusIndicator({
  status,
}: {
  status: "pending" | "approved" | "rejected" | "edited";
}) {
  const configs = {
    pending: { label: "Pending", color: "#4b5563", bg: "#f3f4f6" },
    approved: { label: "Approved", color: "#1a5f4a", bg: "#ecfdf5" },
    rejected: { label: "Rejected", color: "#991b1b", bg: "#fef2f2" },
    edited: { label: "Edited", color: "#78350f", bg: "#fffbeb" },
  };
  const config = configs[status];
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  );
}

// ─── CHANNEL CONFIG PANEL ───

function ChannelConfigPanel({
  state,
  dispatch,
}: {
  state: ContentState;
  dispatch: React.Dispatch<ContentAction>;
}) {
  const platformMap: Record<string, string> = {
    linkedin: "LinkedIn",
    x: "X",
    twitter: "X",
    bluesky: "Bluesky",
  };

  const toggle = (platform: string, integrationId: string) => {
    const current = { ...state.selectedIntegrations };
    if (current[platform] === integrationId) {
      delete current[platform];
    } else {
      current[platform] = integrationId;
    }
    dispatch({ type: "SET_INTEGRATIONS", integrations: current });
    saveIntegrationsToStorage(current);
  };

  return (
    <div className="bg-white rounded-xl border p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Connected Channels
      </h3>
      {state.integrations.length === 0 ? (
        <p className="text-xs text-gray-400">
          No Postiz integrations found. Check POSTIZ_API_URL and POSTIZ_API_KEY.
        </p>
      ) : (
        <div className="space-y-2">
          {state.integrations.map((integration) => {
            const platform =
              integration.identifier === "x"
                ? "twitter"
                : integration.identifier;
            const isSelected =
              state.selectedIntegrations[platform] === integration.id;
            return (
              <label
                key={integration.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(platform, integration.id)}
                  className="rounded border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-600"
                />
                <span className="text-gray-700">
                  {platformMap[integration.identifier] ||
                    integration.identifier}{" "}
                  &mdash; &ldquo;{integration.name}&rdquo;
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  ({integration.identifier})
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PUSH DIALOG ───

function PushDialog({
  state,
  dispatch,
  onClose,
}: {
  state: ContentState;
  dispatch: React.Dispatch<ContentAction>;
  onClose: () => void;
}) {
  const [pushing, setPushing] = useState(false);
  const approvedPosts = state.series.filter(
    (p) => p.status === "approved" || p.status === "edited"
  );

  const handlePush = async () => {
    if (approvedPosts.length === 0) return;
    setPushing(true);
    dispatch({ type: "PUSH_STARTED" });

    try {
      // Build posts payload: resolve edits into final content
      const posts = approvedPosts.map((post) => {
        const platforms: Record<string, string> = {};
        for (const platform of ["linkedin", "twitter", "bluesky"] as const) {
          const edited = (post.edits as Record<string, string>)?.[platform];
          if (edited !== undefined) {
            platforms[platform] = edited;
          } else {
            const original = (
              post.platforms as Record<string, string | string[]>
            )?.[platform];
            if (original) {
              platforms[platform] = Array.isArray(original)
                ? original.join("\n\n")
                : original;
            }
          }
        }
        // Only include platforms that have integrations selected
        const filteredPlatforms: Record<string, string> = {};
        for (const [platform, content] of Object.entries(platforms)) {
          if (state.selectedIntegrations[platform] && content) {
            filteredPlatforms[platform] = content;
          }
        }
        return {
          postNumber: post.postNumber,
          postType: post.postType,
          scheduledDay: post.scheduledDay,
          platforms: filteredPlatforms,
        };
      });

      const response = await fetch("/api/content/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts,
          integrations: state.selectedIntegrations,
          publicationDate: state.publicationDate,
          defaultTime: "09:00",
          articleSlug: state.article?.slug || "content",
        }),
      });

      const data = await response.json();
      if (data.results) {
        dispatch({ type: "PUSH_COMPLETE", results: data.results });
      } else {
        dispatch({
          type: "PUSH_FAILED",
          error: data.error || "Unknown error",
        });
        setPushing(false);
      }
    } catch (error) {
      dispatch({ type: "PUSH_FAILED", error: String(error) });
      setPushing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-6">
      <h3 className="font-serif text-lg font-semibold text-gray-900 mb-4">
        Push to Postiz
      </h3>

      <div className="space-y-3 mb-4">
        <div>
          <label
            htmlFor="publication-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Publication date (blog goes live)
          </label>
          <input
            id="publication-date"
            type="date"
            value={state.publicationDate}
            onChange={(e) =>
              dispatch({
                type: "SET_PUBLICATION_DATE",
                date: e.target.value,
              })
            }
            className="border rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          />
        </div>

        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">
            {approvedPosts.length} posts will be pushed as drafts:
          </p>
          {approvedPosts.map((post) => {
            const platforms = Object.keys(post.platforms).filter(
              (p) => state.selectedIntegrations[p]
            );
            return (
              <p key={post.postNumber} className="text-xs text-gray-500">
                Post {post.postNumber} (Day {post.scheduledDay}):{" "}
                {platforms.length > 0 ? platforms.join(", ") : "no channels"}
              </p>
            );
          })}
        </div>

        {Object.keys(state.selectedIntegrations).length === 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded">
            No channels selected. Configure channels above first.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePush}
          disabled={
            pushing || Object.keys(state.selectedIntegrations).length === 0
          }
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {pushing ? "Pushing..." : "Push Drafts"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── PUSHING PHASE ───

function PushingPhase() {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="animate-pulse mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
      <h2 className="font-serif text-xl font-semibold text-gray-900 mb-2">
        Pushing drafts to Postiz...
      </h2>
      <p className="text-sm text-gray-500">
        Sending posts as scheduled drafts. This may take a moment.
      </p>
    </div>
  );
}

// ─── COMPLETE PHASE ───

function CompletePhase({
  state,
  dispatch,
}: {
  state: ContentState;
  dispatch: React.Dispatch<ContentAction>;
}) {
  const results = state.pushResults || [];
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  // Group results by post number
  const grouped: Record<number, PushResult[]> = {};
  for (const result of results) {
    if (!grouped[result.postNumber]) grouped[result.postNumber] = [];
    grouped[result.postNumber].push(result);
  }

  const retryFailed = async () => {
    const failedResults = results.filter((r) => !r.success);
    if (failedResults.length === 0) return;

    // Re-push failed ones
    const failedPosts: Record<
      number,
      { postNumber: number; postType: string; scheduledDay: number; platforms: Record<string, string> }
    > = {};
    for (const r of failedResults) {
      if (!failedPosts[r.postNumber]) {
        const post = state.series.find((p) => p.postNumber === r.postNumber);
        if (post) {
          failedPosts[r.postNumber] = {
            postNumber: post.postNumber,
            postType: post.postType,
            scheduledDay: post.scheduledDay,
            platforms: {},
          };
        }
      }
      if (failedPosts[r.postNumber]) {
        const post = state.series.find((p) => p.postNumber === r.postNumber);
        if (post) {
          const edited = (post.edits as Record<string, string>)?.[r.platform];
          const original = (
            post.platforms as Record<string, string | string[]>
          )?.[r.platform];
          failedPosts[r.postNumber].platforms[r.platform] =
            edited !== undefined
              ? edited
              : Array.isArray(original)
              ? original.join("\n\n")
              : (original as string) || "";
        }
      }
    }

    dispatch({ type: "PUSH_STARTED" });
    try {
      const response = await fetch("/api/content/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: Object.values(failedPosts),
          integrations: state.selectedIntegrations,
          publicationDate: state.publicationDate,
          defaultTime: "09:00",
          articleSlug: state.article?.slug || "content",
        }),
      });
      const data = await response.json();
      if (data.results) {
        // Merge with existing successful results
        const successful = results.filter((r) => r.success);
        dispatch({
          type: "PUSH_COMPLETE",
          results: [...successful, ...data.results],
        });
      }
    } catch {
      dispatch({ type: "PUSH_FAILED", error: "Retry failed" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">
          Push Complete
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Pushed {successCount} drafts
          {failureCount > 0 ? `, ${failureCount} failed` : ""}.
        </p>

        <div className="space-y-2">
          {Object.entries(grouped).map(([postNum, postResults]) => {
            const post = state.series.find(
              (p) => p.postNumber === Number(postNum)
            );
            return (
              <div
                key={postNum}
                className="text-sm flex items-center gap-2 flex-wrap"
              >
                <span className="font-medium text-gray-700">
                  Post {postNum} (Day {post?.scheduledDay}):
                </span>
                {postResults.map((r) => (
                  <span
                    key={`${r.postNumber}-${r.platform}`}
                    className="text-xs"
                    style={{
                      color: r.success ? "#1a5f4a" : "#991b1b",
                    }}
                  >
                    {r.platform} {r.success ? "\u2713" : "\u2717"}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        {failureCount > 0 && (
          <button
            onClick={retryFailed}
            className="mt-4 px-4 py-2 text-sm border border-red-200 text-red-700 rounded-lg hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Retry failed ({failureCount})
          </button>
        )}

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <ExportButton state={state} />
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            New Series
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT BUTTON ───

function ExportButton({ state }: { state: ContentState }) {
  const handleExport = () => {
    const data = {
      article: state.article
        ? {
            title: state.article.title,
            vertical: state.article.vertical,
            graphUrl: state.article.graphUrl,
            blogUrl: state.article.blogUrl,
            generatedAt: new Date().toISOString(),
          }
        : null,
      series: state.series.map((post) => ({
        postNumber: post.postNumber,
        postType: post.postType,
        scheduledDay: post.scheduledDay,
        status: post.status,
        platforms: {
          ...post.platforms,
          ...post.edits,
        },
        hook: post.hook,
        internalNotes: post.internalNotes,
        suggestedImage: post.suggestedImage,
      })),
      pushHistory: state.pushResults
        ? [
            {
              pushedAt: new Date().toISOString(),
              results: state.pushResults,
            },
          ]
        : [],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-series-${state.article?.slug || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (state.series.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="px-3 py-1 text-xs border rounded hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      Export JSON
    </button>
  );
}
