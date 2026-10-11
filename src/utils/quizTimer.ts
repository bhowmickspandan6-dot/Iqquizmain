import {
  QuizAttemptState,
  getTimerMinutesForQuestionCount,
  normalizeQuizMode,
} from '../types';

const TIMER_STORAGE_KEY = 'iqquiz_timer_timestamps_v1';

export interface PersistedQuizTimerRecord {
  attemptId: string;
  startTimeMs: number;
  endTimeMs: number; // 0 when untimed (Practice Mode)
  totalAllowedSeconds: number;
}

function readTimerStore(): Record<string, PersistedQuizTimerRecord> {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeTimerStore(store: Record<string, PersistedQuizTimerRecord>): void {
  try {
    // Keep at most 40 recent attempts so localStorage stays compact
    const entries = Object.entries(store);
    if (entries.length > 40) {
      entries.sort((a, b) => (b[1]?.startTimeMs || 0) - (a[1]?.startTimeMs || 0));
      const trimmed: Record<string, PersistedQuizTimerRecord> = {};
      for (const [k, v] of entries.slice(0, 40)) {
        trimmed[k] = v;
      }
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(trimmed));
      return;
    }
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

/**
 * Resolves the total allowed seconds for an attempt.
 * - If mode === 'practice' (Practice Mode), returns 0 (Untimed).
 * - For 'timed', 'exam', and 'challenge' modes, uses config.durationMinutes
 *   or the official timer mapping for questionCount.
 */
export function resolveTotalAllowedSeconds(attempt: QuizAttemptState): number {
  const mode = normalizeQuizMode(attempt?.config?.mode);
  if (mode === 'practice') {
    return 0;
  }
  const durMin = Number(attempt?.config?.durationMinutes ?? 0);
  if (durMin > 0) {
    return Math.round(durMin * 60);
  }
  const qCount = attempt?.questions?.length || attempt?.config?.questionCount || 5;
  return Math.round(getTimerMinutesForQuestionCount(qCount) * 60);
}

/**
 * Initializes or retrieves the reliable start/end timestamps for an active quiz attempt.
 * - Called ONLY when the quiz has finished loading and the user begins the quiz.
 * - Never resets if a record already exists for this attemptId (e.g. across page refresh or navigation).
 */
export function getOrInitAttemptTimer(attempt: QuizAttemptState): PersistedQuizTimerRecord {
  const attemptId = attempt.attemptId;
  const totalAllowedSeconds = resolveTotalAllowedSeconds(attempt);
  const store = readTimerStore();
  const existing = store[attemptId];

  if (
    existing &&
    typeof existing.startTimeMs === 'number' &&
    existing.startTimeMs > 0
  ) {
    // Re-compute endTimeMs if totalAllowedSeconds > 0 and endTimeMs was missing
    const resolvedEnd =
      totalAllowedSeconds > 0
        ? existing.endTimeMs > existing.startTimeMs
          ? existing.endTimeMs
          : existing.startTimeMs + totalAllowedSeconds * 1000
        : 0;
    if (
      existing.endTimeMs !== resolvedEnd ||
      existing.totalAllowedSeconds !== totalAllowedSeconds
    ) {
      const updated: PersistedQuizTimerRecord = {
        attemptId,
        startTimeMs: existing.startTimeMs,
        endTimeMs: resolvedEnd,
        totalAllowedSeconds,
      };
      store[attemptId] = updated;
      writeTimerStore(store);
      return updated;
    }
    return existing;
  }

  // Check if the attempt object itself already carries persisted client timestamps
  if (
    typeof attempt.timerStartedAtMs === 'number' &&
    attempt.timerStartedAtMs > 0
  ) {
    const startTimeMs = attempt.timerStartedAtMs;
    const endTimeMs =
      totalAllowedSeconds > 0
        ? typeof attempt.timerEndsAtMs === 'number' && attempt.timerEndsAtMs > startTimeMs
          ? attempt.timerEndsAtMs
          : startTimeMs + totalAllowedSeconds * 1000
        : 0;
    const record: PersistedQuizTimerRecord = {
      attemptId,
      startTimeMs,
      endTimeMs,
      totalAllowedSeconds,
    };
    store[attemptId] = record;
    writeTimerStore(store);
    return record;
  }

  // Otherwise, start the timer right now (when the user begins the quiz after loading)
  const nowMs = Date.now();
  const endTimeMs = totalAllowedSeconds > 0 ? nowMs + totalAllowedSeconds * 1000 : 0;
  const freshRecord: PersistedQuizTimerRecord = {
    attemptId,
    startTimeMs: nowMs,
    endTimeMs,
    totalAllowedSeconds,
  };
  store[attemptId] = freshRecord;
  writeTimerStore(store);
  return freshRecord;
}

/**
 * Computes the current elapsed and remaining seconds from reliable start/end timestamps.
 */
export function computeTimerSnapshot(
  record: PersistedQuizTimerRecord,
  nowMs: number = Date.now()
): {
  elapsedSeconds: number;
  remainingSeconds: number;
  isExpired: boolean;
} {
  const { startTimeMs, endTimeMs, totalAllowedSeconds } = record;
  const rawElapsed = Math.max(0, Math.floor((nowMs - startTimeMs) / 1000));

  if (totalAllowedSeconds <= 0 || endTimeMs <= 0) {
    return {
      elapsedSeconds: rawElapsed,
      remainingSeconds: 0,
      isExpired: false,
    };
  }

  const remainingMs = endTimeMs - nowMs;
  const remainingSeconds = Math.max(
    0,
    Math.min(totalAllowedSeconds, Math.ceil(remainingMs / 1000))
  );
  const elapsedSeconds = Math.min(totalAllowedSeconds, Math.max(0, totalAllowedSeconds - remainingSeconds));

  return {
    elapsedSeconds,
    remainingSeconds,
    isExpired: remainingMs <= 0 || remainingSeconds <= 0,
  };
}

/**
 * Stamps timerStartedAtMs and timerEndsAtMs onto a newly generated QuizAttemptState
 * right when quiz loading finishes and the user starts the quiz.
 */
export function attachInitialTimerToAttempt(attempt: QuizAttemptState): QuizAttemptState {
  const normalizedMode = normalizeQuizMode(attempt.config.mode);
  const qCount = attempt.questions.length || attempt.config.questionCount || 5;
  const normalizedDuration =
    normalizedMode === 'practice'
      ? 0
      : getTimerMinutesForQuestionCount(qCount);

  const updatedAttempt: QuizAttemptState = {
    ...attempt,
    config: {
      ...attempt.config,
      mode: normalizedMode,
      durationMinutes: normalizedDuration as any,
      ...(normalizedMode === 'challenge' ? { difficulty: 'hard' } : {}),
    },
  };

  const timerRec = getOrInitAttemptTimer(updatedAttempt);
  return {
    ...updatedAttempt,
    startedAt: new Date(timerRec.startTimeMs).toISOString(),
    timerStartedAtMs: timerRec.startTimeMs,
    timerEndsAtMs: timerRec.endTimeMs,
  };
}
