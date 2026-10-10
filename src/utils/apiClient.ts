import { QuizAttemptState, StudyNoteAnalysis } from '../types';

/**
 * Safely executes a fetch request, checks HTTP status and Content-Type,
 * inspects raw response text before parsing JSON, and throws a clean,
 * user-friendly Error if the response is HTML/plain-text or an HTTP error.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
    });
  } catch (networkErr: any) {
    throw new Error(
      networkErr?.message ||
        'Network error: Unable to reach the quiz server. Please check your internet connection and try again.'
    );
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const rawText = await response.text();
  const trimmed = rawText.trim();

  // Handle empty response body
  if (!trimmed) {
    throw new Error(
      `Server returned an empty response (HTTP ${response.status}). Please retry.`
    );
  }

  // Detect plain-text or HTML error responses (such as Vercel 404 "The page could not be found" or 502/504 gateway HTML)
  const looksLikeJson =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'));

  if (!contentType.includes('application/json') && !looksLikeJson) {
    if (
      response.status === 404 ||
      trimmed.startsWith('The page could not be found') ||
      trimmed.includes('NOT_FOUND')
    ) {
      throw new Error(
        `Quiz API endpoint (${url}) was not found (HTTP 404). Ensure the serverless /api route and vercel.json are deployed.`
      );
    }
    if (response.status === 429) {
      throw new Error(
        'Too many quiz requests in a short time (HTTP 429). Please wait a few seconds and retry.'
      );
    }
    if (response.status >= 500) {
      throw new Error(
        `The server encountered an error (HTTP ${response.status}) while generating your quiz. Please click Retry.`
      );
    }
    const preview = trimmed.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 120);
    throw new Error(
      `Server returned a non-JSON response (HTTP ${response.status}): ${preview}`
    );
  }

  let parsed: any;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const preview = trimmed.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 120);
    throw new Error(
      `Invalid JSON received from server (HTTP ${response.status}): ${preview}`
    );
  }

  if (!response.ok) {
    const serverErrorMsg =
      typeof parsed?.error === 'string' && parsed.error.trim().length > 0
        ? parsed.error.trim()
        : typeof parsed?.message === 'string' && parsed.message.trim().length > 0
        ? parsed.message.trim()
        : `Request failed with HTTP status ${response.status}.`;
    throw new Error(serverErrorMsg);
  }

  return parsed as T;
}

/**
 * Validates that a quiz attempt payload returned by the server matches
 * the expected QuizAttemptState schema before rendering the quiz UI.
 */
export function validateQuizAttemptPayload(payload: any): QuizAttemptState {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Quiz response is empty or not a valid object.');
  }
  if (typeof payload.attemptId !== 'string' || !payload.attemptId.trim()) {
    throw new Error('Quiz response is missing a valid attemptId.');
  }
  if (!payload.config || typeof payload.config !== 'object') {
    throw new Error('Quiz response is missing configuration metadata.');
  }
  if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
    throw new Error('Quiz response did not contain any valid questions. Please retry.');
  }

  for (let i = 0; i < payload.questions.length; i++) {
    const q = payload.questions[i];
    if (
      !q ||
      typeof q.id !== 'string' ||
      typeof q.questionText !== 'string' ||
      !q.questionText.trim() ||
      !Array.isArray(q.options) ||
      q.options.length < 2
    ) {
      throw new Error(
        `Generated question #${i + 1} failed schema validation. Please retry.`
      );
    }
  }

  return payload as QuizAttemptState;
}

/**
 * Validates that a study notes analysis payload matches the expected schema.
 */
export function validateStudyNotesPayload(payload: any): StudyNoteAnalysis {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Study notes response is not a valid JSON object.');
  }
  if (typeof payload.summary !== 'string' || !payload.summary.trim()) {
    throw new Error('Study notes response is missing a valid summary.');
  }
  return {
    title: String(payload.title || 'Study Notes'),
    summary: String(payload.summary),
    keyConcepts: Array.isArray(payload.keyConcepts) ? payload.keyConcepts : [],
    flashcards: Array.isArray(payload.flashcards) ? payload.flashcards : [],
    mcqs: Array.isArray(payload.mcqs) ? payload.mcqs : [],
    modelUsed: String(payload.modelUsed || ''),
    notice: payload.notice ? String(payload.notice) : undefined,
  };
}
