import type { Analysis, QuickResult } from "./schema";
import type { FailureKind, Source } from "./scanApi";

export type ScanStatus = "idle" | "reading" | "quick-ready" | "done" | "unreadable" | "error";

export interface ScanState {
  /** Increments per scan; actions from an older run are ignored. */
  run: number;
  /** True from the moment a scan starts until the user goes back home. */
  active: boolean;
  photoUrl: string | null;
  /** width / height of the photo, so its frame is sized before it paints. */
  photoAspect: number | null;
  quick: QuickResult | null;
  quickFailed: boolean;
  analysis: Analysis | null;
  analysisFailure: FailureKind | null;
  /** A failure before any request was answered (image decode, quick and analyze both failing). */
  failure: FailureKind | null;
  saved: boolean;
}

export type ScanAction =
  | { type: "start"; run: number }
  | { type: "photo"; run: number; url: string; aspect: number }
  | { type: "quick"; run: number; quick: QuickResult; source: Source }
  | { type: "quick-failed"; run: number; kind: FailureKind }
  | { type: "analysis"; run: number; analysis: Analysis; source: Source }
  | { type: "analysis-failed"; run: number; kind: FailureKind }
  | { type: "fail"; run: number; kind: FailureKind }
  | { type: "reset"; run: number };

export const INITIAL_SCAN: ScanState = {
  run: 0,
  active: false,
  photoUrl: null,
  photoAspect: null,
  quick: null,
  quickFailed: false,
  analysis: null,
  analysisFailure: null,
  failure: null,
  saved: false,
};

export function scanReducer(state: ScanState, action: ScanAction): ScanState {
  if (action.type === "reset") return { ...INITIAL_SCAN, run: action.run };
  if (action.type === "start") return { ...INITIAL_SCAN, run: action.run, active: true };
  if (action.run !== state.run) return state;

  switch (action.type) {
    case "photo":
      return { ...state, photoUrl: action.url, photoAspect: action.aspect };
    case "quick":
      return { ...state, quick: action.quick, saved: state.saved || action.source === "saved" };
    case "quick-failed":
      // Quick is only a head start; the analysis can still carry the result on its own.
      return state.analysisFailure ? { ...state, quickFailed: true, failure: action.kind } : { ...state, quickFailed: true };
    case "analysis":
      return { ...state, analysis: action.analysis, saved: state.saved || action.source === "saved" };
    case "analysis-failed":
      return state.quickFailed ? { ...state, analysisFailure: action.kind, failure: action.kind } : { ...state, analysisFailure: action.kind };
    case "fail":
      return { ...state, failure: action.kind };
  }
}

export function scanStatus(state: ScanState): ScanStatus {
  if (!state.active) return "idle";
  if (state.failure === "unreadable" || state.analysisFailure === "unreadable") return "unreadable";
  if (state.quick?.readable === false || state.analysis?.readable === false) return "unreadable";
  if (state.failure) return "error";
  if (state.analysisFailure) return "error";
  if (state.analysis) return "done";
  if (state.quick) return "quick-ready";
  return "reading";
}

/**
 * The quick read names the product and that name never changes once shown.
 * The analysis name is used only when quick could not name it (or failed) — never as a replacement.
 */
export function scanTitle(state: ScanState): string | null {
  if (state.quick?.productName) return state.quick.productName;
  if (state.quick || state.quickFailed) return state.analysis?.productName ?? null;
  return null;
}

/** The kind of problem the error screen should explain, when there is one. */
export function scanProblem(state: ScanState): FailureKind | null {
  const status = scanStatus(state);
  if (status === "unreadable") return "unreadable";
  if (status === "error") return state.failure ?? state.analysisFailure;
  return null;
}
