/**
 * Save / action feedback patterns for MyVerse.
 *
 * Pick a pattern before wiring a new save handler — see docs/UX.md.
 *
 * - StayOnPage: toast on same screen (profile, publish toggles)
 * - NavigateBack: toast then router.back() (edit sub-screens)
 * - NavigateReplace: landing route is feedback (wizards, deletes)
 * - OverlayThenReplace: full overlay then replace (staff edit)
 */
import { showSuccessToast } from '@/stores/toast-store';

export enum SaveFeedbackPattern {
  StayOnPage = 'StayOnPage',
  NavigateBack = 'NavigateBack',
  NavigateReplace = 'NavigateReplace',
  OverlayThenReplace = 'OverlayThenReplace',
}

const DEFAULT_MIN_SPINNER_MS = 350;

type RunSaveActionOptions<T> = {
  pattern: SaveFeedbackPattern;
  successMessage: string;
  action: () => Promise<T>;
  onSuccess?: (result: T) => void | Promise<void>;
  /** Minimum time isSaving stays true (form saves only). Default 350ms. */
  minSpinnerMs?: number;
  /** Set false for instant actions (reorder). Default true when minSpinnerMs > 0. */
  useMinSpinner?: boolean;
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function runSaveAction<T>({
  pattern,
  successMessage,
  action,
  onSuccess,
  minSpinnerMs = DEFAULT_MIN_SPINNER_MS,
  useMinSpinner = minSpinnerMs > 0,
}: RunSaveActionOptions<T>): Promise<T> {
  const startedAt = Date.now();

  try {
    const result = await action();

    if (useMinSpinner) {
      const elapsed = Date.now() - startedAt;
      const remaining = minSpinnerMs - elapsed;
      if (remaining > 0) {
        await delay(remaining);
      }
    }

    if (
      pattern === SaveFeedbackPattern.StayOnPage ||
      pattern === SaveFeedbackPattern.NavigateBack ||
      pattern === SaveFeedbackPattern.OverlayThenReplace
    ) {
      showSuccessToast(successMessage);
    }

    await onSuccess?.(result);

    return result;
  } catch (error) {
    throw error;
  }
}

/** Fire-and-forget toast for lightweight in-place actions (reorder). */
export function showStaySuccess(message: string) {
  showSuccessToast(message);
}
