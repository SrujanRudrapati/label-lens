"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { prepareImage } from "./image";
import { sampleSrc, type SampleId } from "./samples";
import { isAbort, postAnalyze, postQuick, ScanFailure, type FailureKind } from "./scanApi";
import { INITIAL_SCAN, scanReducer, type ScanState } from "./scanState";
import type { Profile } from "./schema";

export type ScanInput = { kind: "file"; file: File } | { kind: "sample"; sampleId: SampleId };

function failureKind(e: unknown): FailureKind {
  return e instanceof ScanFailure ? e.kind : "server";
}

async function loadInputBlob(input: ScanInput): Promise<Blob> {
  if (input.kind === "file") return input.file;
  const res = await fetch(sampleSrc(input.sampleId)).catch(() => {
    throw new ScanFailure("network");
  });
  if (!res.ok) throw new ScanFailure("server", `sample ${res.status}`);
  return res.blob();
}

export interface UseScan {
  state: ScanState;
  scan: (input: ScanInput) => void;
  retry: () => void;
  reset: () => void;
}

/**
 * idle → reading → quick-ready → done, or → unreadable / error.
 * Quick (Haiku) and analyze (Sonnet) start together on the same image; an unreadable quick read aborts analyze.
 */
export function useScan(profile: Profile): UseScan {
  const [state, dispatch] = useReducer(scanReducer, INITIAL_SCAN);
  const runRef = useRef(0);
  const controllers = useRef<AbortController[]>([]);
  const lastInput = useRef<ScanInput | null>(null);
  const photoUrl = useRef<string | null>(null);

  const cancel = useCallback(() => {
    controllers.current.forEach((c) => c.abort());
    controllers.current = [];
  }, []);

  const swapPhotoUrl = useCallback((next: string | null) => {
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
    photoUrl.current = next;
  }, []);

  const scan = useCallback(
    (input: ScanInput) => {
      cancel();
      const run = ++runRef.current;
      lastInput.current = input;
      dispatch({ type: "start", run, language: profile.language });

      const quickCtl = new AbortController();
      const analyzeCtl = new AbortController();
      controllers.current = [quickCtl, analyzeCtl];
      const sampleId = input.kind === "sample" ? input.sampleId : undefined;

      void (async () => {
        let image: string;
        try {
          const prepared = await prepareImage(await loadInputBlob(input));
          if (run !== runRef.current) return URL.revokeObjectURL(prepared.url);
          swapPhotoUrl(prepared.url);
          dispatch({ type: "photo", run, url: prepared.url, aspect: prepared.width / prepared.height });
          image = prepared.base64;
        } catch (e) {
          if (run === runRef.current) dispatch({ type: "fail", run, kind: e instanceof ScanFailure ? e.kind : "bad_photo" });
          return;
        }

        postQuick({ image, sampleId }, quickCtl.signal)
          .then(({ quick, source }) => {
            if (!quick.readable) analyzeCtl.abort();
            dispatch({ type: "quick", run, quick, source });
          })
          .catch((e: unknown) => {
            if (!isAbort(e)) dispatch({ type: "quick-failed", run, kind: failureKind(e) });
          });

        postAnalyze({ image, sampleId, profile, language: profile.language }, analyzeCtl.signal)
          .then(({ analysis, source }) => dispatch({ type: "analysis", run, analysis, source }))
          .catch((e: unknown) => {
            if (!isAbort(e)) dispatch({ type: "analysis-failed", run, kind: failureKind(e) });
          });
      })();
    },
    [cancel, profile, swapPhotoUrl],
  );

  const retry = useCallback(() => {
    if (lastInput.current) scan(lastInput.current);
  }, [scan]);

  const reset = useCallback(() => {
    cancel();
    const run = ++runRef.current;
    swapPhotoUrl(null);
    dispatch({ type: "reset", run });
  }, [cancel, swapPhotoUrl]);

  useEffect(() => () => {
    cancel();
    swapPhotoUrl(null);
  }, [cancel, swapPhotoUrl]);

  return { state, scan, retry, reset };
}
