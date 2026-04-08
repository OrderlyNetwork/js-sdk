/**
 * Unified tool response envelope (tech §6.2).
 */
export type MatchKind = "exact" | "narrative" | "manifest";

export type Citation = {
  path: string;
  startLine?: number;
  endLine?: number;
  id?: string;
  why: string;
};

export type DocsMetaOk<T> = {
  gitSha: string;
  generatedAt: string;
  queryMs: number;
  matchKind: MatchKind;
  apiVersion: string;
  citations: Citation[];
  resolutionLevel?: "full" | "partial" | "syntax-only";
  degradedReason?: "OOM" | "TIMEOUT" | "UNSUPPORTED_TYPE";
  deprecations?: Array<{ message: string; alternative?: string }>;
};

export type DocsResult<T> =
  | {
      ok: true;
      data: T;
      meta: DocsMetaOk<T>;
    }
  | {
      ok: false;
      error: {
        code:
          | "NOT_FOUND"
          | "STALE_INDEX"
          | "BACKEND_UNAVAILABLE"
          | "INVALID_INPUT"
          | "INVALID_INDEX_SHAPE";
        message: string;
        hint?: string;
      };
      meta: { gitSha?: string; generatedAt?: string; apiVersion?: string };
    };

export type NarrativeHit = {
  id: string;
  path: string;
  heading: string;
  text: string;
  kind?: string;
  score: number;
};
