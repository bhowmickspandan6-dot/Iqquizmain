if (!process.env.VERCEL && typeof process.loadEnvFile === 'function') { try { process.loadEnvFile(); } catch {} }
import crypto from 'crypto';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  CLASS_LEVELS,
  type CurriculumChapter,
  getClassCurriculum,
  getSubjectDefinition,
  getSubjectsForClass,
  resolveCurriculumChaptersForQuiz,
} from '../src/data/curriculum.ts';

// Official supported Gemini models: fast, low-latency, and free-tier eligible
const SUPPORTED_GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
];
const configuredModel = (process.env.GEMINI_MODEL || '').trim();
const ACTIVE_GEMINI_MODEL = SUPPORTED_GEMINI_MODELS.includes(configuredModel)
  ? configuredModel
  : 'gemini-flash-lite-latest';

// Track per-model quota exhaustion, demand spikes, or unavailability so subsequent requests immediately skip failing models
const modelCooldownUntil = new Map<string, number>();

function recordModelFailureCooldown(modelName: string, err: any): void {
  const msg = String(err?.message || err || '').toLowerCase();
  const now = Date.now();

  if (
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('not supported') ||
    msg.includes('no longer available')
  ) {
    modelCooldownUntil.set(modelName, now + 24 * 60 * 60 * 1000);
    return;
  }

  if (
    msg.includes('503') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('service unavailable')
  ) {
    // 503 demand spikes: cool down for 2 minutes so other candidate models respond immediately
    const cooldownMs = 2 * 60 * 1000;
    modelCooldownUntil.set(modelName, now + cooldownMs);
    if (modelName === 'gemini-3.8-flash' || modelName === 'gemini-flash-latest') {
      modelCooldownUntil.set('gemini-3.8-flash', now + cooldownMs);
      modelCooldownUntil.set('gemini-flash-latest', now + cooldownMs);
    }
    return;
  }

  if (msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) {
    const isDailyQuota =
      msg.includes('perday') ||
      msg.includes('free_tier_requests') ||
      msg.includes('retry in 6h') ||
      msg.includes('retry in 5h') ||
      msg.includes('retry in 4h') ||
      msg.includes('retry in 3h') ||
      msg.includes('retry in 2h') ||
      msg.includes('retry in 1h');
    const cooldownMs = isDailyQuota ? 30 * 60 * 1000 : 45 * 1000;
    modelCooldownUntil.set(modelName, now + cooldownMs);

    if (modelName === 'gemini-3.8-flash' || modelName === 'gemini-flash-latest') {
      modelCooldownUntil.set('gemini-3.8-flash', now + cooldownMs);
      modelCooldownUntil.set('gemini-flash-latest', now + cooldownMs);
    }
  }
}

function getOrderedCandidateModels(): string[] {
  const now = Date.now();
  const baseList = Array.from(new Set([ACTIVE_GEMINI_MODEL, ...SUPPORTED_GEMINI_MODELS]));
  const available: string[] = [];
  const cooledDown: string[] = [];

  for (const m of baseList) {
    const until = modelCooldownUntil.get(m) || 0;
    if (until > now) {
      cooledDown.push(m);
    } else {
      available.push(m);
    }
  }

  return [...available, ...cooledDown];
}

// Per-call timeout and bounded replacement passes so serverless functions never hang or loop infinitely
const GEMINI_TIMEOUT_MS = 14000;
const MAX_GENERATION_PASSES = 3;
const MAX_QUESTIONS_PER_CHUNK = 7;

export const config = {
  maxDuration: 30,
};

export type ServerApiErrorCode =
  | 'CONFIG_ERROR'
  | 'AUTH_ERROR'
  | 'QUOTA_ERROR'
  | 'UNAVAILABLE_ERROR'
  | 'TIMEOUT_ERROR'
  | 'PARSING_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'NOT_FOUND_ERROR';

export interface ServerApiErrorPayload {
  error: string;
  code: ServerApiErrorCode;
  correlationId: string;
  stage: string;
  retryable: boolean;
  durationMs?: number;
}

function sanitizeLogMessage(msg: unknown): string {
  if (typeof msg !== 'string') {
    msg = msg ? String(msg) : '';
  }
  return (msg as string)
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/(?:key|apiKey|token|password|secret)=([^&\s]+)/gi, '$1=[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]');
}

function logDiagnostic(
  stage: string,
  details: {
    correlationId?: string;
    route?: string;
    model?: string;
    status?: number;
    durationMs?: number;
    message?: string;
    error?: any;
    extra?: Record<string, any>;
  }
) {
  const safePayload = {
    timestamp: new Date().toISOString(),
    correlationId: details.correlationId || 'none',
    stage,
    route: details.route || 'unknown',
    model: details.model || undefined,
    status: details.status || undefined,
    durationMs: details.durationMs !== undefined ? `${details.durationMs}ms` : undefined,
    message: details.message ? sanitizeLogMessage(details.message) : undefined,
    errorName: details.error?.name || undefined,
    errorMessage: details.error
      ? sanitizeLogMessage(details.error?.message || details.error)
      : undefined,
    ...(details.extra || {}),
  };
  console.info(`[IQ Quiz Diagnostic] [${details.correlationId || 'SYS'}] [${stage}]`, JSON.stringify(safePayload));
}

function logServerError(context: string, err: any, extra?: Record<string, any>) {
  logDiagnostic('SERVER_ERROR', {
    message: context,
    error: err,
    extra,
  });
}

function sanitizeEnvApiKey(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let cleaned = raw.trim();
  // Handle accidental paste of "GEMINI_API_KEY=AIza..." into the environment variable value field
  if (/^[A-Za-z0-9_]+\s*=/.test(cleaned)) {
    cleaned = cleaned.replace(/^[A-Za-z0-9_]+\s*=\s*/, '').trim();
  }
  // Strip surrounding quotes or backticks if present
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '').trim();
  if (
    !cleaned ||
    cleaned === 'MY_GEMINI_API_KEY' ||
    cleaned === 'YOUR_GEMINI_API_KEY' ||
    cleaned === 'undefined' ||
    cleaned === 'null' ||
    cleaned.length <= 10
  ) {
    return '';
  }
  return cleaned;
}

function getServerApiKey(): string {
  // 1. Primary server-side environment variable: exact match process.env.GEMINI_API_KEY
  const primaryKey = sanitizeEnvApiKey(process.env.GEMINI_API_KEY);
  if (primaryKey) {
    return primaryKey;
  }

  // 2. Server-only fallbacks (never client-prefixed VITE_ variables)
  const serverFallbacks = [
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ];
  for (const raw of serverFallbacks) {
    const cleaned = sanitizeEnvApiKey(raw);
    if (cleaned) {
      return cleaned;
    }
  }

  // 3. Tolerate accidental whitespace or case differences in the GEMINI_API_KEY key name in hosting dashboards
  if (process.env && typeof process.env === 'object') {
    for (const [envKey, envVal] of Object.entries(process.env)) {
      if (envKey.trim().toUpperCase() === 'GEMINI_API_KEY') {
        const cleaned = sanitizeEnvApiKey(envVal);
        if (cleaned) {
          return cleaned;
        }
      }
    }
  }

  return '';
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = getServerApiKey();
  if (!apiKey) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    logServerError('getAiClient initialization failed', err);
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateContentWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    correlationId?: string;
  }
): Promise<{ response: any; modelUsed: string; durationMs: number }> {
  const correlationId = params.correlationId || 'req_internal';
  const candidateModels = getOrderedCandidateModels();
  let lastError: any = null;
  const startTotal = Date.now();

  for (let i = 0; i < candidateModels.length; i++) {
    const modelName = candidateModels[i];
    const startAttempt = Date.now();
    try {
      const isLowLatencyThinking =
        modelName.includes('3') ||
        modelName.includes('flash-latest') ||
        modelName.includes('flash-lite');
      const thinkingConfig = isLowLatencyThinking
        ? { thinkingLevel: ThinkingLevel.LOW }
        : undefined;

      const mergedConfig = {
        ...(params.config || {}),
        ...(thinkingConfig ? { thinkingConfig } : {}),
      };

      logDiagnostic('MODEL_ATTEMPT_START', {
        correlationId,
        model: modelName,
        message: `Calling model ${modelName} (attempt ${i + 1}/${candidateModels.length})`,
      });

      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: mergedConfig,
        }),
        GEMINI_TIMEOUT_MS,
        `Gemini generateContent (${modelName})`
      );

      const attemptDuration = Date.now() - startAttempt;
      modelCooldownUntil.delete(modelName);

      logDiagnostic('MODEL_ATTEMPT_SUCCESS', {
        correlationId,
        model: modelName,
        durationMs: attemptDuration,
        message: `Generated successfully with ${modelName} in ${attemptDuration}ms`,
      });

      return {
        response,
        modelUsed: modelName,
        durationMs: Date.now() - startTotal,
      };
    } catch (err: any) {
      lastError = err;
      const attemptDuration = Date.now() - startAttempt;
      const msg = String(err?.message || err || '').toLowerCase();
      const status = err?.status || err?.statusCode;

      logDiagnostic('MODEL_ATTEMPT_FAILED', {
        correlationId,
        model: modelName,
        status,
        durationMs: attemptDuration,
        error: err,
      });

      // If API key itself is invalid or unauthorized, fail immediately without exhausting quotas on other models
      if (
        status === 401 ||
        status === 403 ||
        msg.includes('api_key_invalid') ||
        msg.includes('api key not valid') ||
        msg.includes('invalid api key') ||
        msg.includes('permission_denied')
      ) {
        logDiagnostic('AUTH_ERROR_ABORT', {
          correlationId,
          model: modelName,
          status: status || 401,
          message: 'Gemini API authentication rejected. Aborting model fallback chain.',
        });
        break;
      }

      recordModelFailureCooldown(modelName, err);

      if (i < candidateModels.length - 1) {
        logDiagnostic('MODEL_SWITCHING', {
          correlationId,
          model: modelName,
          message: `Switching to fallback model ${candidateModels[i + 1]}`,
        });
      }
    }
  }

  throw lastError || new Error('Gemini API request failed across all available models.');
}

function parseGeminiJsonSafe(rawText: string | undefined): any {
  if (!rawText || typeof rawText !== 'string') return null;
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!cleaned) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
      } catch {
        // continue
      }
    }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        // continue
      }
    }
    return null;
  }
}

// Universal HTTP helpers for Vercel Serverless Functions, Express, and Node HTTP
function sendJson(res: any, statusCode: number, payload: any) {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  if (typeof res.status === 'function') {
    try {
      res.status(statusCode);
    } catch {
      // ignore
    }
  }
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  if (typeof res.json === 'function') {
    res.json(payload);
  } else if (typeof res.end === 'function') {
    res.end(body);
  }
}

async function readJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    const trimmed = req.body.trim();
    if (!trimmed) return {};
    try {
      return JSON.parse(trimmed);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    const str = req.body.toString('utf8').trim();
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    if (typeof req.on !== 'function') {
      resolve({});
      return;
    }
    req.on('data', (chunk: any) => {
      raw += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    });
    req.on('end', () => {
      const trimmed = raw.trim();
      if (!trimmed) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(trimmed));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function resolveRoutePath(req: any): string {
  const rawUrl = String(req.originalUrl || req.url || '/');
  const [pathnamePart, queryPart] = rawUrl.split('?');

  if (req.query && typeof req.query.__path === 'string' && req.query.__path.trim()) {
    const p = req.query.__path.trim().replace(/^\/+/, '');
    return `/api/${p}`;
  }
  if (queryPart) {
    try {
      const params = new URLSearchParams(queryPart);
      const rewrittenPath = params.get('__path');
      if (rewrittenPath && rewrittenPath.trim()) {
        return `/api/${rewrittenPath.trim().replace(/^\/+/, '')}`;
      }
    } catch {
      // ignore
    }
  }

  let cleanPath = pathnamePart.replace(/\/+$/, '') || '/';
  if (
    !cleanPath.startsWith('/api/') &&
    (cleanPath.startsWith('/quiz/') ||
      cleanPath.startsWith('/notes/') ||
      cleanPath.startsWith('/ai/'))
  ) {
    cleanPath = `/api${cleanPath}`;
  }
  return cleanPath;
}

// ============================================================================
// MULTI-LAYER QUESTION FINGERPRINTING & SEMANTIC SIMILARITY ENGINE
// Supports English (en), Bengali (bn), and Hindi (hi)
// ============================================================================

const MULTILINGUAL_STOPWORDS = new Set([
  // English
  'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'into', 'about', 'which', 'what', 'who', 'whom', 'whose',
  'when', 'where', 'why', 'how', 'following', 'choose', 'select', 'correct', 'option', 'answer',
  'find', 'calculate', 'determine', 'value', 'statement', 'true', 'false', 'according', 'class',
  'if', 'then', 'that', 'this', 'these', 'those', 'an', 'a', 'and', 'or', 'but', 'not', 'does',
  'do', 'did', 'has', 'have', 'had', 'will', 'would', 'can', 'could', 'should', 'called', 'known',
  // Bengali
  'এবং', 'বা', 'কিন্তু', 'যদি', 'তবে', 'হয়', 'হবে', 'ছিল', 'করে', 'করা', 'থেকে', 'জন্য',
  'মধ্যে', 'কোন', 'কোনটি', 'কী', 'কি', 'কত', 'কে', 'কোথায়', 'কেন', 'কিভাবে', 'সঠিক',
  'উত্তর', 'নির্ণয়', 'করো', 'বলতে', 'বলা', 'নিচের', 'প্রদত্ত', 'অনুযায়ী', 'শ্রেণি', 'একটি',
  'দুটি', 'এর', 'এই', 'ওই', 'সেই', 'তা', 'যা', 'যে', 'না', 'নয়', 'হলো', 'হল',
  // Hindi
  'का', 'की', 'के', 'में', 'से', 'को', 'पर', 'और', 'या', 'किन्तु', 'परन्तु', 'यदि', 'तो',
  'है', 'हैं', 'था', 'थे', 'थी', 'होता', 'होती', 'होते', 'होगा', 'होगी', 'कौन', 'क्या',
  'कब', 'कहाँ', 'क्यों', 'कैसे', 'कितना', 'कितनी', 'कितने', 'सही', 'उत्तर', 'विकल्प',
  'चुनें', 'ज्ञात', 'कीजिए', 'निम्नलिखित', 'अनुसार', 'कक्षा', 'एक', 'यह', 'वह', 'इस', 'उस',
  'कहा', 'जाता', 'जाती', 'द्वारा', 'लिए', 'नहीं',
]);

function normalizeDigitsToHash(text: string): string {
  return (text || '')
    .replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6))
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966))
    .replace(/\b\d+(?:[.,]\d+)*\b/g, '#NUM#');
}

function computeFingerprint(text: string): string {
  const normalized = (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

function extractContentTokens(text: string): string[] {
  const digitNormalized = normalizeDigitsToHash(text).toLowerCase();
  const rawTokens = digitNormalized
    .replace(/[^\p{L}\p{M}#]+/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && t !== '#num#' && !MULTILINGUAL_STOPWORDS.has(t));
  return rawTokens;
}

function computeStructuralHash(text: string): string {
  const tokens = extractContentTokens(text);
  const skeleton = tokens.length > 0 ? tokens.join(' ') : normalizeDigitsToHash(text).toLowerCase().trim();
  return crypto.createHash('sha256').update(skeleton).digest('hex').slice(0, 16);
}

function computeTrigramSet(text: string): Set<string> {
  const cleaned = normalizeDigitsToHash(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}#]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const trigrams = new Set<string>();
  if (cleaned.length < 3) {
    if (cleaned) trigrams.add(cleaned);
    return trigrams;
  }
  for (let i = 0; i <= cleaned.length - 3; i++) {
    trigrams.add(cleaned.slice(i, i + 3));
  }
  return trigrams;
}

function computeSetJaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function computeSetDice(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  return (2 * intersection) / (a.size + b.size);
}

export interface HistoryComparisonEntry {
  fingerprint: string;
  structuralHash: string;
  conceptKey: string;
  questionText: string;
  options?: string[];
  classLevel?: number;
  subject?: string;
  topic?: string;
  difficulty?: string;
}

function isQuestionDuplicateOrSimilar(
  candidate: {
    fingerprint: string;
    structuralHash: string;
    conceptKey: string;
    questionText: string;
    options: string[];
  },
  existingEntries: HistoryComparisonEntry[],
  excludedFingerprintsSet: Set<string>
): { duplicate: boolean; reason?: string } {
  if (excludedFingerprintsSet.has(candidate.fingerprint)) {
    return { duplicate: true, reason: 'exact_fingerprint_match' };
  }

  const candTokens = new Set(extractContentTokens(candidate.questionText));
  const candTrigrams = computeTrigramSet(candidate.questionText);
  const candConceptTokens = new Set(
    candidate.conceptKey
      .toLowerCase()
      .split('_')
      .filter((t) => t.length >= 3 && !MULTILINGUAL_STOPWORDS.has(t))
  );
  const candNormalizedOpts = new Set(
    candidate.options.map((o) =>
      o
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}]+/gu, '')
        .trim()
    ).filter(Boolean)
  );

  for (const prev of existingEntries) {
    if (!prev) continue;

    // 1. Exact fingerprint match
    if (prev.fingerprint && prev.fingerprint === candidate.fingerprint) {
      return { duplicate: true, reason: 'exact_fingerprint' };
    }

    // 2. Number-masked structural skeleton hash match
    if (
      prev.structuralHash &&
      prev.structuralHash === candidate.structuralHash &&
      candTokens.size >= 3
    ) {
      return { duplicate: true, reason: 'identical_structural_skeleton' };
    }

    // 3. Exact or near-identical conceptKey match
    if (prev.conceptKey && candidate.conceptKey) {
      const pKey = prev.conceptKey.toLowerCase().trim();
      const cKey = candidate.conceptKey.toLowerCase().trim();
      if (pKey === cKey) {
        return { duplicate: true, reason: `repeated_concept_key (${cKey})` };
      }
      const prevConceptTokens = new Set(
        pKey.split('_').filter((t) => t.length >= 3 && !MULTILINGUAL_STOPWORDS.has(t))
      );
      if (candConceptTokens.size >= 2 && prevConceptTokens.size >= 2) {
        const conceptOverlap = computeSetJaccard(candConceptTokens, prevConceptTokens);
        if (conceptOverlap >= 0.78) {
          return { duplicate: true, reason: `similar_concept_key (${cKey} ~ ${pKey})` };
        }
      }
    }

    // 4. Semantic similarity on questionText (Content Word Jaccard + Character 3-Gram Dice)
    if (prev.questionText && prev.questionText.trim().length > 5) {
      const prevTokens = new Set(extractContentTokens(prev.questionText));
      const tokenJaccard = computeSetJaccard(candTokens, prevTokens);
      if (tokenJaccard >= 0.52) {
        return {
          duplicate: true,
          reason: `high_semantic_word_similarity (${Math.round(tokenJaccard * 100)}%)`,
        };
      }

      const prevTrigrams = computeTrigramSet(prev.questionText);
      const trigramDice = computeSetDice(candTrigrams, prevTrigrams);
      if (trigramDice >= 0.64) {
        return {
          duplicate: true,
          reason: `high_trigram_similarity (${Math.round(trigramDice * 100)}%)`,
        };
      }

      // 5. Combined moderate stem similarity + overlapping answer options
      if (tokenJaccard >= 0.35 && Array.isArray(prev.options) && prev.options.length > 0) {
        const prevOpts = new Set(
          prev.options
            .map((o) =>
              String(o || '')
                .toLowerCase()
                .replace(/[^\p{L}\p{M}\p{N}]+/gu, '')
                .trim()
            )
            .filter(Boolean)
        );
        let sharedOptions = 0;
        for (const opt of candNormalizedOpts) {
          if (prevOpts.has(opt)) sharedOptions++;
        }
        if (sharedOptions >= 2) {
          return {
            duplicate: true,
            reason: 'similar_stem_and_shared_answer_options',
          };
        }
      }
    }
  }

  return { duplicate: false };
}

// Per-user persistent in-memory store (supplements client Firestore + localStorage history)
const userHistoryStore = new Map<string, HistoryComparisonEntry[]>();

function getUserServerHistory(userId: string): HistoryComparisonEntry[] {
  if (!userHistoryStore.has(userId)) {
    userHistoryStore.set(userId, []);
  }
  return userHistoryStore.get(userId)!;
}

function recordQuestionsInServerHistory(
  userId: string,
  questions: ServerQuestion[]
) {
  const list = getUserServerHistory(userId);
  const existingFps = new Set(list.map((item) => item.fingerprint));
  for (const q of questions) {
    if (!existingFps.has(q.fingerprint)) {
      existingFps.add(q.fingerprint);
      list.push({
        fingerprint: q.fingerprint,
        structuralHash: q.structuralHash,
        conceptKey: q.conceptKey,
        questionText: q.questionText,
        options: q.options,
        classLevel: q.classLevel,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
      });
    }
  }
  // Keep latest 500 per user in memory
  if (list.length > 500) {
    list.splice(0, list.length - 500);
  }
}

// ============================================================================
// CURRICULUM SUBTOPIC & PEDAGOGICAL REASONING VARIATION MATRIX
// ============================================================================

const SUBJECT_SUBTOPIC_POOL: Record<string, string[]> = {
  mathematics: [
    'Number System, Prime Factorization, HCF & LCM Word Problems',
    'Fractions, Decimals, Rational & Irrational Numbers',
    'Ratio, Proportion, Unitary Method & Partnership',
    'Percentage, Profit & Loss, Discount & Overhead Charges',
    'Simple Interest, Compound Interest & Uniform Rate of Growth',
    'Time, Distance, Relative Speed & Work-Rate Problems',
    'Algebraic Expressions, Identities, Factorization & Polynomials',
    'Linear Equations, Simultaneous Equations & Quadratic Roots',
    'Laws of Indices, Exponents, Surds & Logarithmic Relations',
    'Lines, Angles, Parallel Transversals & Polygon Interior Angles',
    'Triangle Congruence, Similarity, Pythagoras Theorem & Inequalities',
    'Quadrilaterals, Parallelograms, Rhombus & Trapezium Properties',
    'Circle Chords, Tangents, Cyclic Quadrilaterals & Subtended Angles',
    'Perimeter & Area of Plane Figures, Sectors, Rings & Pathways',
    'Surface Area & Volume of Cube, Cuboid, Cylinder, Cone & Sphere',
    'Coordinate Geometry, Distance Formula, Section Formula & Graphs',
    'Trigonometric Ratios, Standard Angles, Identities & Heights/Distances',
    'Statistics, Mean, Median, Mode, Frequency Polygons & Probability',
  ],
  physical_science: [
    'Measurement, SI Units, Dimensional Analysis & Scalar/Vector Quantities',
    'Rest & Motion, Displacement, Velocity, Acceleration & Equations of Motion',
    'Newton’s Laws of Motion, Momentum Conservation, Impulse & Friction',
    'Work, Power, Mechanical Energy, Kinetic & Potential Energy Conservation',
    'Gravitation, Acceleration due to Gravity, Weight & Archimedes Buoyancy',
    'Pressure in Fluids, Pascal’s Law, Atmospheric Pressure & Barometer',
    'Heat, Temperature Scales, Specific Heat, Latent Heat & Calorimetry',
    'Thermal Expansion of Solids, Liquids, Gases & Heat Transfer Modes',
    'Reflection of Light, Plane & Spherical Mirrors, Magnification & Ray Diagrams',
    'Refraction of Light, Snell’s Law, Total Internal Reflection, Lenses & Prism',
    'Sound Waves, Frequency, Wavelength, Echo, Sonar & Audible Range',
    'Current Electricity, Ohm’s Law, Series/Parallel Resistors, Joule’s Heating & Power',
    'Electromagnetism, Fleming’s Rules, Electric Motor & Electromagnetic Induction',
    'Atomic Structure, Isotopes, Isobars, Electronic Configuration & Periodic Table Trends',
    'Chemical Bonding (Ionic & Covalent), Valency, Oxidation & Reduction Reactions',
    'Acids, Bases, Salts, pH Scale, Neutralization & Indicators',
    'Gas Laws (Boyle’s Law, Charles’s Law, Avogadro’s Law, Ideal Gas Equation & Mole Concept)',
    'Metallurgy, Ores, Alloys, Corrosion, Carbon Compounds & Functional Groups',
  ],
  life_science: [
    'Cell Structure, Prokaryotic vs Eukaryotic Cells & Cell Organelles Functions',
    'Cell Division: Mitosis, Meiosis, Chromosome Structure, DNA & Cell Cycle',
    'Plant & Animal Tissues: Meristematic, Permanent, Xylem, Phloem, Epithelial & Muscular',
    'Photosynthesis: Light & Dark Phases, Pigments, Stomatal Opening & Significance',
    'Respiration: Aerobic, Anaerobic, Glycolysis, Krebs Cycle & Respiratory Organs',
    'Plant Nutrition, Transpiration, Ascent of Sap, Mineral Deficiency & Tropism',
    'Human Digestive System, Enzymes, Peristalsis, Liver, Pancreas & Assimilation',
    'Circulatory System: Heart Chambers, Double Circulation, Blood Groups, Lymph & ECG',
    'Excretory System: Nephron Structure, Ultrafiltration, Osmoregulation & Plant Excretion',
    'Nervous System: Neuron, Synapse, Reflex Arc, Brain Regions & Cranial/Spinal Nerves',
    'Endocrine System: Pituitary, Thyroid, Adrenal, Pancreas Hormones & Feedback Control',
    'Plant Hormones (Auxin, Gibberellin, Cytokinin) & Photoperiodism',
    'Reproduction in Plants & Animals, Pollination, Double Fertilization & Vegetative Propagation',
    'Genetics & Heredity: Mendel’s Laws, Monohybrid/Dihybrid Cross, Sex Determination & Genetic Disorders',
    'Evolution: Lamarckism, Darwinism, Natural Selection, Homologous/Analogous Organs & Fossils',
    'Microorganisms, Immunity, Vaccination, Antibiotics, Pathogens & Human Diseases',
    'Ecology, Food Chains, Energy Flow, Nitrogen Cycle, Biodiversity Conservation & Hotspots',
  ],
  english: [
    'Parts of Speech, Articles, Prepositions & Phrasal Verbs in Context',
    'Tenses, Sequence of Tenses, Subject-Verb Agreement & Conditional Clauses',
    'Active and Passive Voice Transformation across Tenses & Imperatives',
    'Direct and Indirect (Reported) Speech: Statements, Questions & Commands',
    'Synthesis & Transformation of Sentences: Simple, Complex & Compound',
    'Clauses: Noun Clause, Adjective/Relative Clause & Adverbial Clause Identification',
    'Non-Finite Verbs: Infinitives, Gerunds & Participles Usage',
    'Vocabulary: Synonyms, Antonyms, Homophones, One-Word Substitution & Idioms',
    'Prefixes, Suffixes, Word Formation, Spelling Rules & Punctuation',
    'Figures of Speech: Simile, Metaphor, Personification, Alliteration & Irony',
    'Reading Comprehension Inference, Tone Analysis & Contextual Meaning',
    'WBBSE Classic Prose & Poetry Themes, Character Analysis & Literary Devices',
  ],
  bangla: [
    'ধ্বনিতত্ত্ব ও বর্ণবিশ্লেষণ: স্বরধ্বনি, ব্যঞ্জনধ্বনি, উচ্চারণ স্থান ও মাত্রা',
    'সন্ধি বিচ্ছেদ ও সন্ধিবদ্ধ পদ: স্বরসন্ধি, ব্যঞ্জনসন্ধি ও বিসর্গসন্ধি',
    'শব্দভাণ্ডার: তৎসম, তদ্ভব, দেশি, বিদেশি, যৌগিক ও যোগরূঢ় শব্দ',
    'পদ প্রকরণ ও পদ পরিবর্তন: বিশেষ্য থেকে বিশেষণ এবং সর্বনাম ও অব্যয়ের শ্রেণিবিভাগ',
    'কারক ও বিভক্তি নির্ণয়: কর্তৃ, কর্ম, করণ, নিমিত্ত, অপাদান ও অধিকরণ কারক',
    'সমাস নির্ণয় ও ব্যাসবাক্য: দ্বন্দ্ব, তৎপুরুষ, কর্মধারয়, বহুব্রীহি, দ্বিগু ও অব্যয়ীভাব',
    'প্রত্যয়, উপসর্গ ও অনুসর্গ: কৃত্ প্রত্যয় ও তদ্ধিত প্রত্যয়ের প্রয়োগ',
    'বাক্যতত্ত্ব ও বাক্য পরিবর্তন: সরল, জটিল, যৌগিক এবং কর্তৃবাচ্য, কর্মবাচ্য ও ভাববাচ্য',
    'শব্দার্থ: সমার্থক শব্দ, বিপরীতার্থক শব্দ, সমোচ্চারিত ভিন্নার্থক শব্দ ও এককথায় প্রকাশ',
    'বাগধারা, প্রবাদ-প্রবচন, বানান শুদ্ধিকরণ ও যতিচিহ্নের ব্যবহার',
    'বাংলা সাহিত্যের ইতিহাস ও পাঠ্যপুস্তক: রবীন্দ্রনাথ, নজরুল, শরৎচন্দ্র, সুকুমার রায় ও বিভূতিভূষণ',
  ],
  hindi: [
    'वर्णमाला एवं ध्वनि विचार: स्वर, व्यंजन, उच्चारण स्थान, अल्पप्राण एवं महाप्राण',
    'संधि एवं संधि-विच्छेद: स्वर संधि (दीर्घ, गुण, वृद्धि, यण, अयादि), व्यंजन एवं विसर्ग संधि',
    'शब्द भेद: तत्सम, तद्भव, देशज, विदेशज तथा रूढ़, यौगिक एवं योगरूढ़ शब्द',
    'संज्ञा, सर्वनाम, विशेषण, क्रिया एवं अव्यय के भेद तथा रूपान्तरण',
    'कारक एवं विभक्ति चिह्न: कर्ता से अधिकरण और संबोधन कारक की पहचान',
    'समास विग्रह एवं भेद: अव्ययीभाव, तत्पुरुष, कर्मधारय, द्विगु, द्वन्द्व एवं बहुब्रीहि समास',
    'उपसर्ग एवं प्रत्यय: मूल शब्द से उपसर्ग और प्रत्यय अलग करना',
    'वाक्य विचार एवं रूपांतरण: सरल, संयुक्त, मिश्र वाक्य तथा कर्तृवाच्य, कर्मवाच्य, भाववाच्य',
    'पर्यायवाची शब्द, विलोम शब्द, अनेकार्थी शब्द एवं वाक्यांश के लिए एक शब्द',
    'मुहावरे, लोकोक्तियाँ, वर्तनी शुद्धिकरण एवं विराम चिह्न',
    'अलंकार एवं छंद: अनुप्रास, यमक, श्लेष, उपमा, रूपक एवं मानवीकरण अलंकार',
    'हिंदी साहित्य एवं पाठ्यपुस्तक: प्रेमचंद, कबीर, सूरदास, तुलसीदास, महादेवी वर्मा एवं दिनकर',
  ],
  gk: [
    'Indian Freedom Struggle, Key Movements, Dates, Leaders & Historical Treaties',
    'Indian Constitution, Fundamental Rights, Parliament, President, Supreme Court & Amendments',
    'Geography of India & West Bengal: Rivers, Mountain Passes, Soil, Climate & National Parks',
    'Solar System, Astronomy, ISRO Space Missions (Chandrayaan, Aditya-L1, Gaganyaan) & Satellites',
    'Nobel Laureates, Bharat Ratna, Major Literary Awards, Sports Trophies & Olympic Records',
    'Inventions, Scientific Discoveries, Diagnostic Instruments, SI Units & Famous Scientists',
    'World Geography: Continents, Oceans, Straits, Capitals, Currencies & International Boundaries',
    'United Nations Agencies (UNESCO, UNICEF, WHO, WTO, IMF), Headquarters & Global Summits',
    'Indian Economy, RBI, Five-Year Plans, National Symbols, Classical Dances & UNESCO Heritage Sites',
    'Environmental Science, Ramsar Wetlands, Biosphere Reserves, Renewable Energy & Climate Treaties',
    'Computer Fundamentals, Networking, Cybersecurity, Supercomputers & Modern Technology',
    'Human Body Facts, Vitamins, Deficiency Diseases, Vaccines & Medical Milestones',
  ],
};

const SUBJECT_DOMAIN_GUARDRAILS: Record<string, string> = {
  mathematics:
    'STRICT DOMAIN GUARDRAIL (MATHEMATICS): Generate ONLY authentic mathematical problems, numerical calculations, algebraic manipulations, geometric proofs/properties, mensuration, trigonometry, coordinate geometry, or statistics strictly from the prescribed WBBPE/WBBSE Mathematics textbook. Every calculation must be 100% verified.',
  science:
    'STRICT DOMAIN GUARDRAIL (ENVIRONMENT & SCIENCE — PARIBESH O BIGYAN): Generate ONLY scientific questions (Physics, Chemistry, Biology, Environmental Science) strictly grounded in the prescribed WBBSE Paribesh o Bigyan textbook for this class.',
  physical_science:
    'STRICT DOMAIN GUARDRAIL (PHYSICAL SCIENCE — BHOUTO BIGYAN O PARIBESH): Generate ONLY Physics and Chemistry questions (SI units, motion, force, heat, light, sound, electricity, atomic structure, gas laws, periodic table, chemical bonding, metallurgy, organic chemistry) strictly from WBBSE Bhouto Bigyan o Paribesh.',
  life_science:
    'STRICT DOMAIN GUARDRAIL (LIFE SCIENCE — JIBAN BIGYAN O PARIBESH): Generate ONLY Biology, physiology, cytology, photosynthesis, respiration, circulation, nervous/endocrine control, cell division, heredity/genetics, evolution, and ecology questions strictly from WBBSE Jiban Bigyan o Paribesh.',
  history:
    'STRICT DOMAIN GUARDRAIL (HISTORY — ATIT O AITIHYYA / ITIHAS O PARIBESH): Generate ONLY historical questions (chronology, civilizations, dynasties, rulers, social/religious reforms, peasant/tribal movements, Indian freedom struggle) strictly from the prescribed WBBPE/WBBSE History syllabus.',
  geography:
    'STRICT DOMAIN GUARDRAIL (GEOGRAPHY — AMADER PRITHIBI / BHUGOL O PARIBESH): Generate ONLY geographical questions (exogenetic/endogenetic processes, atmosphere, hydrosphere, landforms, climate, soil, rivers, agriculture, industries, maps, West Bengal & India regional geography) strictly from the prescribed WBBPE/WBBSE Geography syllabus.',
  evs:
    'STRICT DOMAIN GUARDRAIL (ENVIRONMENTAL STUDIES — AMADER PARIBESH): Generate ONLY Environmental Studies questions covering human body systems, natural environment, biodiversity, landforms & rivers of West Bengal, natural resources, sky/space, and social heritage from WBBPE Amader Paribesh.',
  english:
    'STRICT DOMAIN GUARDRAIL (ENGLISH — BUTTERFLY / BLOSSOMS / BLISS & GRAMMAR): Generate ONLY English textbook comprehension questions (prose/poetry authors, characters, plot events, themes, and word meanings from the prescribed WBBPE/WBBSE textbook lesson) and WBBSE functional English grammar/vocabulary questions.',
  bangla:
    'STRICT DOMAIN GUARDRAIL (BANGLA — PATABAHAR / SAHITYA MELA / SAHITYA SANCHAYAN & BYAKARAN): Generate ONLY Bengali literature questions (authors, characters, themes, literary context from the prescribed textbook chapters) and Bengali grammar (Bhasha Path / Bangla Byakaran: Dhwani, Sandhi, Karaka, Samasa, Pratyaya, Bakya) questions.',
  hindi:
    'STRICT DOMAIN GUARDRAIL (HINDI — FIRST LANGUAGE & VYAKARAN): Generate ONLY Hindi grammar (Vyakaran: Varnamala, Sandhi, Samasa, Karak, Upsarg/Pratyay, Vakya, Alankar) and age-appropriate Hindi literature questions for this class level.',
  gk:
    'STRICT DOMAIN GUARDRAIL (GENERAL KNOWLEDGE): Generate ONLY curriculum-aligned General Knowledge questions appropriate for this class level.',
};

const COGNITIVE_REASONING_ANGLES = [
  'Conceptual Mechanism & Cause-and-Effect Analysis',
  'Multi-Step Quantitative / Numerical Calculation with Fresh Values',
  'Real-World Practical Scenario & Applied Problem Solving',
  'Comparative Distinction & Identifying the Exception / Odd Property',
  'Critical Thinking & Resolving Common Student Misconceptions',
  'Deductive Inference from Experimental / Textual / Historical Evidence',
  'Reverse-Reasoning (Given the Outcome, Find the Underlying Input/Condition)',
  'Structural Classification & Principle Application',
];

interface ServerQuestion {
  id: string;
  fingerprint: string;
  structuralHash: string;
  conceptKey: string;
  classLevel: number;
  subject: string;
  topic: string;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  textbookName?: string;
  board?: 'WBBPE' | 'WBBSE';
  curriculumVerificationStatus?: 'verified' | 'pending_verification';
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'en' | 'bn' | 'hi';
  questionType: 'mcq' | 'tf';
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

interface ServerLockedAnswer {
  questionId: string;
  selectedIndex: number;
  lockedAt: string;
  isCorrect: boolean;
}

type ServerQuizMode = 'practice' | 'timed' | 'exam' | 'challenge' | 'test';

function normalizeServerQuizMode(mode?: string): 'practice' | 'timed' | 'exam' | 'challenge' {
  if (mode === 'practice') return 'practice';
  if (mode === 'timed') return 'timed';
  if (mode === 'challenge') return 'challenge';
  if (mode === 'exam' || mode === 'test') return 'exam';
  return 'timed';
}

interface ServerQuizAttempt {
  attemptId: string;
  parentAttemptId?: string;
  userId: string;
  config: {
    classLevel: number;
    subject: string;
    quizLanguage: 'en' | 'bn' | 'hi';
    topic: string;
    chapterId?: string;
    textbookName?: string;
    board?: 'WBBPE' | 'WBBSE';
    curriculumVerificationStatus?: 'verified' | 'pending_verification';
    difficulty: string;
    questionCount: number;
    questionType: string;
    durationMinutes: number;
    mode: ServerQuizMode;
  };
  questions: ServerQuestion[];
  lockedAnswers: Record<string, ServerLockedAnswer>;
  markedForReview: string[];
  status: 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  timeTakenSeconds: number;
  scoreSummary?: any;
  generationInfo: {
    model: string;
    source: 'gemini-ai' | 'verified-curriculum-engine';
    board?: 'WBBPE' | 'WBBSE';
    textbookName?: string;
    syllabusCode?: string;
    verificationStatus?: 'verified' | 'pending_verification';
    excludedHistoryCount: number;
    uniqueConceptsCount: number;
    notice?: string;
  };
}

const serverAttempts = new Map<string, ServerQuizAttempt>();

interface ServerChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: 'en' | 'bn' | 'hi';
  modelUsed?: string;
}

interface ServerChatConversation {
  chatId: string;
  userId: string;
  title: string;
  language: 'en' | 'bn' | 'hi';
  messages: ServerChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const serverUserChats = new Map<string, Map<string, ServerChatConversation>>();

function getUserChatMap(userId: string): Map<string, ServerChatConversation> {
  const cleanId = String(userId || 'local_student').trim().slice(0, 128) || 'local_student';
  let map = serverUserChats.get(cleanId);
  if (!map) {
    map = new Map<string, ServerChatConversation>();
    serverUserChats.set(cleanId, map);
  }
  return map;
}

function getTokenSecretKey(): Buffer {
  const secretSeed = getServerApiKey() || process.env.APP_URL || 'iq-quiz-stateless-token-key-v1';
  return crypto.createHash('sha256').update(secretSeed).digest();
}

function encodeServerStateToken(attempt: ServerQuizAttempt): string {
  try {
    const key = getTokenSecretKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const plaintext = Buffer.from(JSON.stringify(attempt), 'utf8');
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64url');
  } catch {
    return '';
  }
}

function decodeServerStateToken(token?: string): ServerQuizAttempt | null {
  if (!token || typeof token !== 'string') return null;
  try {
    const raw = Buffer.from(token, 'base64url');
    if (raw.length < 29) return null;
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const key = getTokenSecretKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    const parsed = JSON.parse(decrypted);
    if (parsed && typeof parsed.attemptId === 'string' && Array.isArray(parsed.questions)) {
      return parsed as ServerQuizAttempt;
    }
    return null;
  } catch {
    return null;
  }
}

function resolveServerAttempt(
  attemptId: string,
  serverStateToken?: string,
  lockedAnswersSnapshot?: Record<string, any>,
  markedForReviewSnapshot?: string[]
): ServerQuizAttempt | null {
  let attempt = serverAttempts.get(attemptId) || null;
  if (!attempt && serverStateToken) {
    const decoded = decodeServerStateToken(serverStateToken);
    if (decoded && decoded.attemptId === attemptId) {
      attempt = decoded;
      serverAttempts.set(attemptId, attempt);
    }
  }
  if (!attempt) return null;

  if (lockedAnswersSnapshot && typeof lockedAnswersSnapshot === 'object') {
    for (const [qId, snapLock] of Object.entries(lockedAnswersSnapshot)) {
      if (!attempt.lockedAnswers[qId] && snapLock && typeof snapLock.selectedIndex === 'number') {
        const q = attempt.questions.find((item) => item.id === qId);
        if (q) {
          attempt.lockedAnswers[qId] = {
            questionId: qId,
            selectedIndex: snapLock.selectedIndex,
            lockedAt: String(snapLock.lockedAt || new Date().toISOString()),
            isCorrect: snapLock.selectedIndex === q.correctIndex,
          };
        }
      }
    }
  }

  if (Array.isArray(markedForReviewSnapshot) && attempt.markedForReview.length === 0) {
    attempt.markedForReview = markedForReviewSnapshot.filter(
      (qId) => typeof qId === 'string' && !attempt!.lockedAnswers[qId]
    );
  }

  return attempt;
}

function sanitizeAttemptForClient(attempt: ServerQuizAttempt) {
  const isCompleted = attempt.status === 'completed';
  const normalizedMode = normalizeServerQuizMode(attempt.config.mode);
  const hidesAnswersUntilCompleted = normalizedMode === 'exam';

  const clientQuestions = attempt.questions.map((q) => {
    const isQuestionLocked = Boolean(attempt.lockedAnswers[q.id]);
    const revealAnswer = isCompleted || (!hidesAnswersUntilCompleted && isQuestionLocked);

    return {
      id: q.id,
      fingerprint: q.fingerprint,
      structuralHash: q.structuralHash,
      conceptKey: q.conceptKey,
      classLevel: q.classLevel,
      subject: q.subject,
      topic: q.topic,
      chapterId: q.chapterId,
      chapterNumber: q.chapterNumber,
      chapterTitle: q.chapterTitle,
      textbookName: q.textbookName,
      board: q.board,
      curriculumVerificationStatus: q.curriculumVerificationStatus,
      difficulty: q.difficulty,
      language: q.language,
      questionType: q.questionType,
      questionText: q.questionText,
      options: q.options,
      hint: q.hint,
      ...(revealAnswer
        ? {
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          }
        : {}),
    };
  });

  const clientLockedAnswers: Record<string, any> = {};
  for (const [qId, lock] of Object.entries(attempt.lockedAnswers)) {
    const q = attempt.questions.find((item) => item.id === qId);
    const revealAnswer = isCompleted || !hidesAnswersUntilCompleted;
    clientLockedAnswers[qId] = {
      questionId: lock.questionId,
      selectedIndex: lock.selectedIndex,
      lockedAt: lock.lockedAt,
      ...(revealAnswer && q
        ? {
            isCorrect: lock.isCorrect,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          }
        : {}),
    };
  }

  return {
    attemptId: attempt.attemptId,
    parentAttemptId: attempt.parentAttemptId,
    userId: attempt.userId,
    config: attempt.config,
    questions: clientQuestions,
    lockedAnswers: clientLockedAnswers,
    markedForReview: attempt.markedForReview,
    status: attempt.status,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    timeTakenSeconds: attempt.timeTakenSeconds,
    scoreSummary: isCompleted ? attempt.scoreSummary : undefined,
    serverStateToken: encodeServerStateToken(attempt),
    generationInfo: attempt.generationInfo,
  };
}

function computeScoreSummary(attempt: ServerQuizAttempt, timeTakenSeconds: number) {
  const totalQuestions = attempt.questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const topicMap = new Map<
    string,
    { topic: string; total: number; correct: number; incorrect: number; unanswered: number }
  >();

  for (const q of attempt.questions) {
    const tKey = q.topic || 'General';
    if (!topicMap.has(tKey)) {
      topicMap.set(tKey, { topic: tKey, total: 0, correct: 0, incorrect: 0, unanswered: 0 });
    }
    const tEntry = topicMap.get(tKey)!;
    tEntry.total += 1;

    const lock = attempt.lockedAnswers[q.id];
    if (!lock) {
      unansweredCount += 1;
      tEntry.unanswered += 1;
    } else if (lock.isCorrect) {
      correctCount += 1;
      tEntry.correct += 1;
    } else {
      incorrectCount += 1;
      tEntry.incorrect += 1;
    }
  }

  const topicBreakdown = Array.from(topicMap.values()).map((item) => ({
    ...item,
    accuracy: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0,
  }));

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    score: correctCount,
    maxScore: totalQuestions,
    percentage,
    timeTakenSeconds,
    topicBreakdown,
  };
}

function validateAndNormalizeQuestion(
  raw: any,
  config: {
    classLevel: number;
    subject: string;
    quizLanguage: 'en' | 'bn' | 'hi';
    topic: string;
    difficulty: string;
    board?: 'WBBPE' | 'WBBSE';
    textbookName?: string;
    curriculumVerificationStatus?: 'verified' | 'pending_verification';
    fallbackChapter?: CurriculumChapter;
    allSubjectChapters?: CurriculumChapter[];
  },
  index: number
): ServerQuestion | null {
  if (!raw || typeof raw.questionText !== 'string' || raw.questionText.trim().length < 5) {
    return null;
  }

  const qType: 'mcq' | 'tf' = raw.questionType === 'tf' ? 'tf' : 'mcq';
  let options: string[] = Array.isArray(raw.options)
    ? raw.options.map((o: any) => String(o || '').trim()).filter((o: string) => o.length > 0)
    : [];

  if (qType === 'tf') {
    const tfLabels: Record<'en' | 'bn' | 'hi', [string, string]> = {
      en: ['True', 'False'],
      bn: ['সত্য (True)', 'মিথ্যা (False)'],
      hi: ['सत्य (True)', 'असत्य (False)'],
    };
    options = tfLabels[config.quizLanguage] || tfLabels.en;
  } else {
    const uniqueOpts = Array.from(new Set(options));
    if (uniqueOpts.length < 4) {
      return null;
    }
    options = uniqueOpts.slice(0, 4);
  }

  let correctIndex = Number(raw.correctIndex);
  if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= options.length
  ) {
    return null;
  }

  // Deterministic option shuffle for MCQs so the correct option index is varied across 0..3
  if (qType === 'mcq' && options.length === 4) {
    const correctOptionText = options[correctIndex];
    const hashByte = crypto
      .createHash('md5')
      .update(`${raw.questionText}_${index}_${Date.now()}`)
      .digest()[0];
    const shift = hashByte % 4;
    if (shift > 0) {
      const rotated = [
        options[(0 + shift) % 4],
        options[(1 + shift) % 4],
        options[(2 + shift) % 4],
        options[(3 + shift) % 4],
      ];
      const newIdx = rotated.indexOf(correctOptionText);
      if (newIdx !== -1) {
        options = rotated;
        correctIndex = newIdx;
      }
    }
  }

  const explanation =
    typeof raw.explanation === 'string' && raw.explanation.trim().length > 5
      ? raw.explanation.trim()
      : config.quizLanguage === 'bn'
      ? `সঠিক উত্তর হলো "${options[correctIndex]}" কারণ এটি পশ্চিমবঙ্গ বোর্ডের পাঠ্যক্রমের তথ্যের সাথে সামঞ্জস্যপূর্ণ।`
      : config.quizLanguage === 'hi'
      ? `सही उत्तर "${options[correctIndex]}" है क्योंकि यह पश्चिम बंगाल बोर्ड पाठ्यक्रम के सिद्धांत के अनुरूप है।`
      : `The correct answer is "${options[correctIndex]}" based on verified WBBSE/WBBPE curriculum principles.`;

  const cleanText = raw.questionText.trim();
  const fp = computeFingerprint(cleanText);
  const sHash = computeStructuralHash(cleanText);
  const conceptKey =
    typeof raw.conceptKey === 'string' && raw.conceptKey.trim().length > 2
      ? raw.conceptKey
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
          .slice(0, 80)
      : `${config.subject}_c${config.classLevel}_${fp.slice(0, 10)}`;

  const diff: 'easy' | 'medium' | 'hard' =
    raw.difficulty === 'easy' || raw.difficulty === 'medium' || raw.difficulty === 'hard'
      ? raw.difficulty
      : config.difficulty === 'easy' || config.difficulty === 'medium' || config.difficulty === 'hard'
      ? config.difficulty
      : index % 3 === 0
      ? 'easy'
      : index % 3 === 1
      ? 'medium'
      : 'hard';

  // Match returned chapterId or topic back to the structured WBBSE curriculum chapter
  let matchedChapter: CurriculumChapter | undefined = config.fallbackChapter;
  if (Array.isArray(config.allSubjectChapters) && config.allSubjectChapters.length > 0) {
    const rawChapterId = typeof raw.chapterId === 'string' ? raw.chapterId.trim() : '';
    const rawTopicStr = typeof raw.topic === 'string' ? raw.topic.trim().toLowerCase() : '';
    if (rawChapterId) {
      const byId = config.allSubjectChapters.find((c) => c.id === rawChapterId);
      if (byId) matchedChapter = byId;
    }
    if (!matchedChapter && rawTopicStr) {
      const byTitle = config.allSubjectChapters.find(
        (c) =>
          rawTopicStr.includes(c.title.en.toLowerCase()) ||
          rawTopicStr.includes(c.title.bn.toLowerCase()) ||
          rawTopicStr.includes(c.title.hi.toLowerCase()) ||
          c.title.en.toLowerCase().includes(rawTopicStr)
      );
      if (byTitle) matchedChapter = byTitle;
    }
    if (!matchedChapter) {
      matchedChapter = config.allSubjectChapters[index % config.allSubjectChapters.length];
    }
  }

  const resolvedChapterTitle = matchedChapter
    ? matchedChapter.title[config.quizLanguage] || matchedChapter.title.en
    : undefined;

  const resolvedTopic =
    typeof raw.topic === 'string' &&
    raw.topic.trim().length > 2 &&
    raw.topic.trim() !== 'All Verified Chapters'
      ? raw.topic.trim()
      : resolvedChapterTitle || config.topic || 'Core Curriculum';

  return {
    id: `q_${config.classLevel}_${config.subject}_${fp}_${index}`,
    fingerprint: fp,
    structuralHash: sHash,
    conceptKey,
    classLevel: config.classLevel,
    subject: config.subject,
    topic: resolvedTopic,
    chapterId: matchedChapter?.id,
    chapterNumber: matchedChapter?.chapterNumber,
    chapterTitle: resolvedChapterTitle,
    textbookName: config.textbookName,
    board: config.board || (config.classLevel === 5 ? 'WBBPE' : 'WBBSE'),
    curriculumVerificationStatus: config.curriculumVerificationStatus || 'verified',
    difficulty: diff,
    language: config.quizLanguage,
    questionType: qType,
    questionText: cleanText,
    options,
    correctIndex,
    explanation,
    hint:
      typeof raw.hint === 'string' && raw.hint.trim().length > 2
        ? raw.hint.trim()
        : undefined,
  };
}

// ============================================================================
// DYNAMIC GEMINI QUIZ GENERATION WITH WBBSE/WBBPE CHAPTER COVERAGE & DEDUPLICATION
// Never returns hardcoded or cached quizzes.
// ============================================================================

async function generateFreshVerifiedQuizQuestions(params: {
  ai: GoogleGenAI;
  classLevel: number;
  subject: string;
  quizLanguage: 'en' | 'bn' | 'hi';
  topic: string;
  difficulty: string;
  questionCount: number;
  questionType: string;
  existingHistory: HistoryComparisonEntry[];
  excludedFingerprints: Set<string>;
}): Promise<{
  questions: ServerQuestion[];
  modelUsed: string;
  rejectedDuplicatesCount: number;
  curriculumMeta: {
    board: 'WBBPE' | 'WBBSE';
    textbookName: string;
    syllabusCode: string;
    verificationStatus: 'verified' | 'pending_verification';
    chapterId?: string;
  };
}> {
  const {
    ai,
    classLevel,
    subject,
    quizLanguage,
    topic,
    difficulty,
    questionCount,
    questionType,
    existingHistory,
    excludedFingerprints,
  } = params;

  const langName =
    quizLanguage === 'bn'
      ? 'Bengali (বাংলা)'
      : quizLanguage === 'hi'
      ? 'Hindi (हिन्दी)'
      : 'English';

  // Resolve official WBBPE/WBBSE curriculum context for (classLevel, subject, topic)
  const curriculumResolution = resolveCurriculumChaptersForQuiz(
    classLevel as any,
    subject as any,
    topic
  );
  const curriculumCtx = curriculumResolution.curriculum;
  const isSingleChapter = !curriculumResolution.isAllChapters;
  const boardName: 'WBBPE' | 'WBBSE' = classLevel === 5 ? 'WBBPE' : 'WBBSE';
  const subjectDef = getSubjectDefinition(subject as any);
  const subjectDisplayName = subjectDef
    ? `${subjectDef.name.en} (${subjectDef.name[quizLanguage]})`
    : subject;
  const localizedTextbookName =
    curriculumCtx.textbookName[quizLanguage] || curriculumCtx.textbookName.en;
  const domainGuardrail =
    SUBJECT_DOMAIN_GUARDRAILS[subject] || SUBJECT_DOMAIN_GUARDRAILS.gk;

  // Working comparison store starts with all previously seen questions for this user/class/subject
  const comparisonPool: HistoryComparisonEntry[] = [...existingHistory];
  const workingFingerprints = new Set<string>(excludedFingerprints);
  for (const h of existingHistory) {
    if (h.fingerprint) workingFingerprints.add(h.fingerprint);
  }

  const acceptedQuestions: ServerQuestion[] = [];
  const rejectedStemsThisRun: string[] = [];
  let resolvedModelName = ACTIVE_GEMINI_MODEL;
  let rejectedDuplicatesCount = 0;

  const randomSeedNumber = crypto.randomBytes(4).readUInt32BE(0);
  const activeChapters = curriculumResolution.selectedChapters;

  // Deterministically rotate chapters for even multi-chapter distribution when "All Verified Chapters" is selected
  const rotatedChapters: CurriculumChapter[] =
    activeChapters.length > 1
      ? activeChapters
          .map((chItem: CurriculumChapter, idx: number) => ({
            chItem,
            score: (idx * 37 + randomSeedNumber) % 997,
          }))
          .sort((a: { score: number }, b: { score: number }) => a.score - b.score)
          .map((x: { chItem: CurriculumChapter }) => x.chItem)
      : activeChapters;

  const fallbackSubtopicPool =
    SUBJECT_SUBTOPIC_POOL[subject] || SUBJECT_SUBTOPIC_POOL.gk;

  for (let pass = 1; pass <= MAX_GENERATION_PASSES; pass++) {
    const remainingNeeded = questionCount - acceptedQuestions.length;
    if (remainingNeeded <= 0) break;

    // Request a small buffer (+2) so if 1-2 items are similar to history, we still complete in Pass 1
    const batchRequestCount =
      pass === 1
        ? Math.min(remainingNeeded + 2, 54)
        : Math.min(remainingNeeded + 3, 20);

    // Build token-optimized exclusion context from history + current accepted + rejected
    const recentConceptKeys = Array.from(
      new Set(
        comparisonPool
          .map((h) => h.conceptKey)
          .filter((k) => typeof k === 'string' && k.length > 2)
      )
    ).slice(-45);

    const recentQuestionStems = comparisonPool
      .map((h) => (h.questionText || '').replace(/\s+/g, ' ').trim())
      .filter((s) => s.length > 5)
      .slice(-28)
      .map((s, idx) => `${idx + 1}. "${s.slice(0, 105)}"`);

    const slotAssignments: string[] = [];
    const slotChapters: (CurriculumChapter | undefined)[] = [];

    for (let s = 0; s < batchRequestCount; s++) {
      const angleChoice =
        COGNITIVE_REASONING_ANGLES[
          (randomSeedNumber + s + pass * 3) % COGNITIVE_REASONING_ANGLES.length
        ];

      if (rotatedChapters.length > 0) {
        const assignedChapter: CurriculumChapter = isSingleChapter
          ? rotatedChapters[0]
          : rotatedChapters[(s + (pass - 1) * 3) % rotatedChapters.length];
        slotChapters.push(assignedChapter);

        const concepts = assignedChapter.keyConcepts || [];
        const conceptFocus =
          concepts.length > 0
            ? concepts[(s + (pass - 1) * 2) % concepts.length]
            : assignedChapter.title.en;

        slotAssignments.push(
          `- Question ${s + 1}: ChapterId="${assignedChapter.id}" | Chapter="Ch ${assignedChapter.chapterNumber}: ${assignedChapter.title.en} (${assignedChapter.title[quizLanguage]})" | Syllabus Topic Focus="[${conceptFocus}]" | Reasoning Angle="[${angleChoice}]"`
        );
      } else {
        slotChapters.push(undefined);
        const subtopicChoice =
          fallbackSubtopicPool[
            (s + (pass - 1) * 5) % fallbackSubtopicPool.length
          ];
        slotAssignments.push(
          `- Question ${s + 1}: Subtopic Focus="[${subtopicChoice}]" | Reasoning Angle="[${angleChoice}]"`
        );
      }
    }

    const systemInstruction = `You are a senior West Bengal Board (${boardName}) academic curriculum examiner for Class ${classLevel}.
${domainGuardrail}

OFFICIAL CURRICULUM & TEXTBOOK CONTEXT:
- Board: ${boardName} (${
      boardName === 'WBBPE'
        ? 'West Bengal Board of Primary Education'
        : 'West Bengal Board of Secondary Education'
    })
- Class: Class ${classLevel}
- Academic Subject: ${subjectDisplayName} (subject id: "${subject}")
- Prescribed Textbook: ${curriculumCtx.textbookName.en} / ${curriculumCtx.textbookName.bn}
- Syllabus Version: ${curriculumCtx.syllabusVersion} (${curriculumCtx.verificationStatus})

CRITICAL GENERATION RULES:
1. Subject & Chapter Fidelity: Every question MUST strictly test the assigned WBBPE/WBBSE chapter and syllabus topic for "${subjectDisplayName}" in Class ${classLevel}. Never mix subjects (e.g., Mathematics must stay strictly mathematical, History strictly historical, Geography strictly geographical, Physical Science strictly Physics/Chemistry, Life Science strictly Biology).
2. Presentation Language Independence: Write the questionText, options, hint, and explanation strictly in "${langName}" (language code: "${quizLanguage}"), even when the subject is English, Bangla, or Hindi.
3. Factual & Mathematical Precision: Every question must be 100% factually, scientifically, and mathematically accurate according to the Class ${classLevel} WBBPE/WBBSE textbook. Double-check all calculations so the option at correctIndex is indisputably right.
4. ZERO DUPLICATES & HIGH DIVERSITY: Never repeat or paraphrase any previously asked question stem or concept key listed in the prompt.
5. Keep each explanation concise (1-2 clear sentences referencing the textbook concept) and each hint brief (1 short sentence).
6. For questionType "${questionType}": if "mcq", provide 4 distinct, plausible options and correctIndex (0-3). If "tf", provide 2 options (True/False in ${langName}) and correctIndex (0 or 1). If "mixed", include a mix of "mcq" and "tf" questions.`;

    const exclusionSection =
      recentConceptKeys.length > 0 || recentQuestionStems.length > 0 || rejectedStemsThisRun.length > 0
        ? `\nSTRICT EXCLUSION LIST (DO NOT REPEAT OR PARAPHRASE ANY OF THESE):
- Previously Tested Concept Keys to Avoid: [${recentConceptKeys.join(', ') || 'none'}]
${
  recentQuestionStems.length > 0
    ? `- Previously Asked Question Stems for this User (Forbidden to repeat or reword):\n${recentQuestionStems.join('\n')}`
    : ''
}
${
  rejectedStemsThisRun.length > 0
    ? `- Duplicate Stems Rejected in Earlier Pass (MUST NOT reuse these concepts or structures):\n${rejectedStemsThisRun
        .slice(-10)
        .map((r) => `  * "${r}"`)
        .join('\n')}`
    : ''
}\n`
        : '';

    // Split large question requests into parallel sub-batches so generation completes quickly without timing out
    const chunkLimit = questionCount >= 30 ? 10 : MAX_QUESTIONS_PER_CHUNK;
    const chunkDescriptors: {
      count: number;
      slots: string[];
      chapters: (CurriculumChapter | undefined)[];
      chunkIndex: number;
    }[] = [];
    for (let offset = 0, cIdx = 0; offset < batchRequestCount; offset += chunkLimit, cIdx++) {
      const sliceSlots = slotAssignments.slice(offset, offset + chunkLimit);
      const sliceChapters = slotChapters.slice(offset, offset + chunkLimit);
      chunkDescriptors.push({
        count: sliceSlots.length,
        slots: sliceSlots,
        chapters: sliceChapters,
        chunkIndex: cIdx,
      });
    }

    const questionItemSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: {
            type: Type.STRING,
            description: `Full question text written in ${langName}`,
          },
          questionType: {
            type: Type.STRING,
            description: 'Either "mcq" or "tf"',
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '4 distinct options for mcq, or 2 options for tf',
          },
          correctIndex: {
            type: Type.INTEGER,
            description: '0-based index of the single correct option',
          },
          explanation: {
            type: Type.STRING,
            description: `Concise 1-2 sentence explanation of why the correct option is right, in ${langName}`,
          },
          hint: {
            type: Type.STRING,
            description: `Short 1-sentence helpful hint without giving away the answer, in ${langName}`,
          },
          chapterId: {
            type: Type.STRING,
            description: 'Exact ChapterId assigned to this question slot',
          },
          topic: {
            type: Type.STRING,
            description: `Chapter title or specific syllabus topic in ${langName}`,
          },
          difficulty: {
            type: Type.STRING,
            description: 'easy, medium, or hard',
          },
          conceptKey: {
            type: Type.STRING,
            description:
              'Specific snake_case identifier of the exact academic concept & scenario tested',
          },
        },
        required: [
          'questionText',
          'questionType',
          'options',
          'correctIndex',
          'explanation',
          'topic',
          'difficulty',
          'conceptKey',
        ],
      },
    };

    const chunkResults = await Promise.allSettled(
      chunkDescriptors.map(async (chunk) => {
        const chunkPrompt = `${
          pass > 1
            ? `[REPLACEMENT GENERATION PASS #${pass}]: Generate ${chunk.count} BRAND-NEW, completely different replacement questions.\n`
            : ''
        }Generate exactly ${chunk.count} unique, fresh WBBPE/WBBSE curriculum quiz questions for:
- Board & Class: ${boardName} Class ${classLevel}
- Academic Subject: ${subjectDisplayName}
- Prescribed Textbook: ${localizedTextbookName}
- Selected Chapter / Scope: ${
          isSingleChapter && activeChapters[0]
            ? `Chapter ${activeChapters[0].chapterNumber}: ${activeChapters[0].title.en} (${activeChapters[0].title[quizLanguage]})`
            : `All Verified Chapters (${activeChapters.length} chapters in textbook)`
        }
- Difficulty Level: ${difficulty}
- Question Type: ${questionType}
- Presentation Language: ${langName} (language code: ${quizLanguage})
- Cryptographic Entropy Seed: ${Date.now()}_${randomSeedNumber}_pass${pass}_chunk${chunk.chunkIndex}

REQUIRED CHAPTER, TOPIC & REASONING SLOT PLAN FOR THIS BATCH:
${chunk.slots.join('\n')}
${exclusionSection}`;

        const res = await generateContentWithModelFallback(ai, {
          contents: chunkPrompt,
          config: {
            systemInstruction,
            temperature: pass === 1 ? 0.85 : 0.92,
            responseMimeType: 'application/json',
            responseSchema: questionItemSchema,
          },
        });
        return { ...res, slotChapters: chunk.chapters };
      })
    );

    const candidateArray: { rawItem: any; assignedChapter?: CurriculumChapter }[] = [];
    let lastChunkError: any = null;

    for (const resItem of chunkResults) {
      if (resItem.status === 'fulfilled') {
        resolvedModelName = resItem.value.modelUsed;
        const parsed = parseGeminiJsonSafe(resItem.value.response?.text);
        const items = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.questions)
          ? parsed.questions
          : Array.isArray(parsed?.items)
          ? parsed.items
          : [];
        items.forEach((rawItem: any, idx: number) => {
          candidateArray.push({
            rawItem,
            assignedChapter: resItem.value.slotChapters[idx],
          });
        });
      } else {
        lastChunkError = resItem.reason;
      }
    }

    if (candidateArray.length === 0 && lastChunkError && acceptedQuestions.length === 0) {
      throw lastChunkError;
    }

    for (const { rawItem, assignedChapter } of candidateArray) {
      if (acceptedQuestions.length >= questionCount) break;

      const normalized = validateAndNormalizeQuestion(
        rawItem,
        {
          classLevel,
          subject,
          quizLanguage,
          topic,
          difficulty,
          board: boardName,
          textbookName: localizedTextbookName,
          curriculumVerificationStatus: curriculumCtx.verificationStatus,
          fallbackChapter: assignedChapter,
          allSubjectChapters: activeChapters,
        },
        acceptedQuestions.length
      );

      if (!normalized) continue;

      const simCheck = isQuestionDuplicateOrSimilar(
        normalized,
        comparisonPool,
        workingFingerprints
      );

      if (simCheck.duplicate) {
        rejectedDuplicatesCount++;
        rejectedStemsThisRun.push(
          `${normalized.questionText.slice(0, 90)} [reason: ${simCheck.reason}]`
        );
        if (
          pass === MAX_GENERATION_PASSES &&
          !workingFingerprints.has(normalized.fingerprint) &&
          simCheck.reason !== 'exact_fingerprint' &&
          simCheck.reason !== 'exact_fingerprint_match'
        ) {
          workingFingerprints.add(normalized.fingerprint);
          comparisonPool.push({
            fingerprint: normalized.fingerprint,
            structuralHash: normalized.structuralHash,
            conceptKey: normalized.conceptKey,
            questionText: normalized.questionText,
            options: normalized.options,
            classLevel: normalized.classLevel,
            subject: normalized.subject,
            topic: normalized.topic,
            difficulty: normalized.difficulty,
          });
          acceptedQuestions.push(normalized);
        }
        continue;
      }

      workingFingerprints.add(normalized.fingerprint);
      comparisonPool.push({
        fingerprint: normalized.fingerprint,
        structuralHash: normalized.structuralHash,
        conceptKey: normalized.conceptKey,
        questionText: normalized.questionText,
        options: normalized.options,
        classLevel: normalized.classLevel,
        subject: normalized.subject,
        topic: normalized.topic,
        difficulty: normalized.difficulty,
      });
      acceptedQuestions.push(normalized);
    }

    if (acceptedQuestions.length >= questionCount) {
      break;
    }
  }

  return {
    questions: acceptedQuestions,
    modelUsed: resolvedModelName,
    rejectedDuplicatesCount,
    curriculumMeta: {
      board: boardName,
      textbookName: localizedTextbookName,
      syllabusCode: curriculumCtx.syllabusVersion,
      verificationStatus: curriculumCtx.verificationStatus,
      chapterId:
        isSingleChapter && activeChapters[0]
          ? activeChapters[0].id
          : undefined,
    },
  };
}

// ============================================================================
// MAIN UNIVERSAL SERVERLESS & EXPRESS API HANDLER
// ============================================================================

export default async function handler(req: any, res: any) {
  try {
    const method = String(req.method || 'GET').toUpperCase();
    const routePath = resolveRoutePath(req);

    if (method === 'OPTIONS') {
      res.statusCode = 204;
      if (typeof res.end === 'function') res.end();
      return;
    }

    // 1. Health & AI Status Endpoint
    if (method === 'GET' && routePath === '/api/ai/status') {
      const hasKey = Boolean(getServerApiKey());
      sendJson(res, 200, {
        status: hasKey ? 'ready' : 'missing_api_key',
        apiKeyConfigured: hasKey,
        requiredEnvVar: 'GEMINI_API_KEY',
        model: ACTIVE_GEMINI_MODEL,
        supportedModels: SUPPORTED_GEMINI_MODELS,
        freeTierEligible: true,
      });
      return;
    }

    // 1b. Official WBBPE/WBBSE Curriculum Database Inspection Endpoint
    if (method === 'GET' && routePath === '/api/curriculum') {
      const summary = CLASS_LEVELS.map((cls) => {
        const subjects = getSubjectsForClass(cls);
        const board: 'WBBPE' | 'WBBSE' = cls === 5 ? 'WBBPE' : 'WBBSE';
        return {
          classLevel: cls,
          board,
          subjects: subjects.map((sub) => {
            const curr = getClassCurriculum(cls, sub.id);
            return {
              subjectId: sub.id,
              name: sub.name,
              board,
              textbookName: curr.textbookName,
              syllabusVersion: curr.syllabusVersion,
              verificationStatus: curr.verificationStatus,
              officialSource: curr.officialSource,
              chapterCount: curr.chapters.length,
              chapters: curr.chapters.map((ch: CurriculumChapter) => ({
                id: ch.id,
                chapterNumber: ch.chapterNumber,
                title: ch.title,
                topicsCount: ch.keyConcepts.length,
                topics: ch.keyConcepts,
              })),
            };
          }),
        };
      });
      sendJson(res, 200, {
        curriculumBoard: 'WBBPE (Class 5) & WBBSE (Classes 6–10)',
        classes: summary,
      });
      return;
    }

    // 2. Generate Unique Quiz Endpoint (Dynamic Gemini AI + WBBSE Curriculum + Multi-Layer Deduplication)
    if (method === 'POST' && routePath === '/api/quiz/generate') {
      const body = await readJsonBody(req);
      const {
        classLevel = 8,
        subject = 'mathematics',
        quizLanguage = 'en',
        topic = 'All Verified Chapters',
        difficulty = 'mixed',
        questionCount = 5,
        questionType = 'mcq',
        durationMinutes = 10,
        mode = 'practice',
        userId = 'local_student',
        clientExcludedFingerprints = [],
        clientExcludedHistory = [],
      } = body || {};

      const ai = getAiClient();
      if (!ai) {
        logServerError(
          'Missing GEMINI_API_KEY in /api/quiz/generate',
          new Error('GEMINI_API_KEY is not configured in server environment variables.')
        );
        sendJson(res, 503, {
          error:
            'Gemini AI API key is not configured on the server. Please add GEMINI_API_KEY in your Environment Variables and redeploy.',
        });
        return;
      }

      const numClass = Number(classLevel);
      if (![5, 6, 7, 8, 9, 10].includes(numClass)) {
        sendJson(res, 400, {
          error: `Invalid class level (${classLevel}). Supported classes are 5, 6, 7, 8, 9, and 10.`,
        });
        return;
      }
      const validClass = numClass as 5 | 6 | 7 | 8 | 9 | 10;

      const classSubjects = getSubjectsForClass(validClass);
      const isSubjectValid = classSubjects.some((s) => s.id === subject);
      if (!isSubjectValid) {
        sendJson(res, 400, {
          error: `Subject "${subject}" is not applicable for Class ${validClass}. Please select a valid subject for this class.`,
        });
        return;
      }

      if (quizLanguage !== 'en' && quizLanguage !== 'bn' && quizLanguage !== 'hi') {
        sendJson(res, 400, {
          error: `Invalid quiz language "${quizLanguage}". Supported languages are English (en), Bengali (bn), and Hindi (hi).`,
        });
        return;
      }
      const validQuizLang: 'en' | 'bn' | 'hi' = quizLanguage;

      const numCount = Number(questionCount);
      if (![5, 10, 15, 20, 30, 50].includes(numCount)) {
        sendJson(res, 400, {
          error: `Invalid question count (${questionCount}). Supported counts are 5, 10, 15, 20, 30, or 50.`,
        });
        return;
      }
      const validCount = numCount;
      const cleanUserId = String(userId || 'local_student');

      // Merge server-side history with persistent client history (from Firestore + localStorage)
      const serverHist = getUserServerHistory(cleanUserId);
      const mergedHistoryMap = new Map<string, HistoryComparisonEntry>();

      for (const item of serverHist) {
        if (
          item &&
          item.fingerprint &&
          (!item.classLevel || item.classLevel === validClass) &&
          (!item.subject || item.subject === subject)
        ) {
          mergedHistoryMap.set(item.fingerprint, item);
        }
      }

      if (Array.isArray(clientExcludedHistory)) {
        for (const item of clientExcludedHistory) {
          if (item && typeof item.questionText === 'string' && item.questionText.trim()) {
            const fp =
              typeof item.fingerprint === 'string' && item.fingerprint.trim()
                ? item.fingerprint.trim()
                : computeFingerprint(item.questionText);
            const sHash =
              typeof item.structuralHash === 'string' && item.structuralHash.trim()
                ? item.structuralHash.trim()
                : computeStructuralHash(item.questionText);
            mergedHistoryMap.set(fp, {
              fingerprint: fp,
              structuralHash: sHash,
              conceptKey: String(item.conceptKey || ''),
              questionText: item.questionText.trim(),
              options: Array.isArray(item.options) ? item.options.map(String) : undefined,
              classLevel: Number(item.classLevel) || validClass,
              subject: String(item.subject || subject),
              topic: String(item.topic || topic),
              difficulty: String(item.difficulty || difficulty),
            });
          }
        }
      }

      const excludedFingerprintsSet = new Set<string>();
      for (const item of serverHist) {
        if (item.fingerprint) excludedFingerprintsSet.add(item.fingerprint);
      }
      if (Array.isArray(clientExcludedFingerprints)) {
        for (const fp of clientExcludedFingerprints) {
          if (typeof fp === 'string' && fp.trim()) {
            excludedFingerprintsSet.add(fp.trim());
          }
        }
      }

      const relevantHistory = Array.from(mergedHistoryMap.values());

      try {
        const normalizedMode = normalizeServerQuizMode(mode);
        const resolvedDifficulty =
          normalizedMode === 'challenge' ? 'hard' : String(difficulty || 'mixed');

        const { questions, modelUsed, rejectedDuplicatesCount, curriculumMeta } =
          await generateFreshVerifiedQuizQuestions({
            ai,
            classLevel: validClass,
            subject: String(subject),
            quizLanguage: validQuizLang,
            topic: String(topic),
            difficulty: resolvedDifficulty,
            questionCount: validCount,
            questionType: String(questionType),
            existingHistory: relevantHistory,
            excludedFingerprints: excludedFingerprintsSet,
          });

        if (questions.length === 0) {
          sendJson(res, 502, {
            error:
              'Gemini AI returned an empty or invalid question set. Please click Retry to generate a fresh quiz.',
          });
          return;
        }

        // Persist newly generated questions into server history for this user
        recordQuestionsInServerHistory(cleanUserId, questions);

        const timerMap: Record<number, number> = { 5: 3, 10: 7, 15: 10, 20: 15, 30: 25, 50: 45 };
        const resolvedDuration =
          normalizedMode === 'practice'
            ? 0
            : timerMap[questions.length] ?? timerMap[validCount] ?? (Number(durationMinutes) || 3);

        const attemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const attempt: ServerQuizAttempt = {
          attemptId,
          userId: cleanUserId,
          config: {
            classLevel: validClass,
            subject: String(subject),
            quizLanguage: validQuizLang,
            topic: String(topic),
            chapterId: curriculumMeta.chapterId,
            textbookName: curriculumMeta.textbookName,
            board: curriculumMeta.board,
            curriculumVerificationStatus: curriculumMeta.verificationStatus,
            difficulty: resolvedDifficulty,
            questionCount: questions.length,
            questionType: String(questionType),
            durationMinutes: resolvedDuration,
            mode: normalizedMode,
          },
          questions,
          lockedAnswers: {},
          markedForReview: [],
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          timeTakenSeconds: 0,
          generationInfo: {
            model: modelUsed,
            source: 'gemini-ai',
            board: curriculumMeta.board,
            textbookName: curriculumMeta.textbookName,
            syllabusCode: curriculumMeta.syllabusCode,
            verificationStatus: curriculumMeta.verificationStatus,
            excludedHistoryCount: excludedFingerprintsSet.size,
            uniqueConceptsCount: questions.length,
            notice:
              rejectedDuplicatesCount > 0
                ? `Filtered ${rejectedDuplicatesCount} similar question(s) and generated fresh Gemini AI replacements.`
                : undefined,
          },
        };

        serverAttempts.set(attemptId, attempt);
        console.info(
          `[IQ Quiz Server] Fresh WBBSE quiz generated | attemptId=${attemptId} | model=${modelUsed} | board=${curriculumMeta.board} | class=${validClass} | subject=${subject} | textbook="${curriculumMeta.textbookName}" | lang=${validQuizLang} | excludedHistory=${excludedFingerprintsSet.size} | rejectedSimilar=${rejectedDuplicatesCount}`
        );
        sendJson(res, 200, sanitizeAttemptForClient(attempt));
        return;
      } catch (aiErr: any) {
        const status = aiErr?.status || aiErr?.statusCode || 503;
        logServerError('Gemini quiz generation failed in /api/quiz/generate', aiErr, {
          classLevel: validClass,
          subject,
          quizLanguage: validQuizLang,
          status,
        });
        const msg = String(aiErr?.message || aiErr || '').toLowerCase();
        if (
          status === 401 ||
          status === 403 ||
          msg.includes('api_key_invalid') ||
          msg.includes('api key not valid') ||
          msg.includes('invalid api key') ||
          msg.includes('permission_denied')
        ) {
          sendJson(res, 401, {
            error:
              'The configured GEMINI_API_KEY on the server was rejected or unauthorized by Google Gemini API. Please verify your GEMINI_API_KEY in Vercel Project Settings → Environment Variables and redeploy.',
          });
          return;
        }
        if (status === 429 || msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) {
          sendJson(res, 429, {
            error:
              'Gemini AI rate limit or quota exceeded. Please wait a few seconds and click Retry Quiz Generation.',
          });
          return;
        }
        if (status === 503 || msg.includes('503') || msg.includes('high demand') || msg.includes('unavailable')) {
          sendJson(res, 503, {
            error:
              'Gemini AI is currently experiencing high temporary demand (HTTP 503). Please click Retry Quiz Generation to try again.',
          });
          return;
        }
        if (status === 504 || msg.includes('timed out') || msg.includes('timeout')) {
          sendJson(res, 504, {
            error:
              'Gemini AI request timed out. Please click Retry Quiz Generation to try again.',
          });
          return;
        }
        const detailedMessage = aiErr?.message
          ? `Gemini API error: ${aiErr.message}`
          : 'Unable to reach Gemini AI right now to generate fresh questions. Please click Retry Quiz Generation.';
        sendJson(res, status >= 400 && status < 600 ? status : 503, {
          error: detailedMessage,
        });
        return;
      }
    }

    // 3. Strict Irreversible Answer Locking Endpoint
    if (method === 'POST' && routePath === '/api/quiz/lock-answer') {
      const body = await readJsonBody(req);
      const {
        attemptId,
        questionId,
        selectedIndex,
        timeTakenSeconds,
        serverStateToken,
        lockedAnswersSnapshot,
      } = body || {};

      if (!attemptId || !questionId || typeof selectedIndex !== 'number') {
        sendJson(res, 400, { error: 'Missing attemptId, questionId, or selectedIndex.' });
        return;
      }

      const attempt = resolveServerAttempt(attemptId, serverStateToken, lockedAnswersSnapshot);
      if (!attempt) {
        sendJson(res, 404, { error: 'Quiz attempt not found on server.' });
        return;
      }

      if (attempt.status === 'completed') {
        sendJson(res, 409, {
          error: 'This quiz attempt has already been submitted and finalized. Answers cannot be altered.',
          attempt: sanitizeAttemptForClient(attempt),
        });
        return;
      }

      if (attempt.lockedAnswers[questionId]) {
        sendJson(res, 409, {
          error: 'Answer is permanently locked for this attempt and cannot be changed.',
          lockedRecord: attempt.lockedAnswers[questionId],
          attempt: sanitizeAttemptForClient(attempt),
        });
        return;
      }

      const question = attempt.questions.find((q) => q.id === questionId);
      if (!question) {
        sendJson(res, 404, { error: 'Question not found in this attempt.' });
        return;
      }

      if (selectedIndex < 0 || selectedIndex >= question.options.length) {
        sendJson(res, 400, { error: 'Invalid option index.' });
        return;
      }

      const isCorrect = selectedIndex === question.correctIndex;
      const lockedRecord: ServerLockedAnswer = {
        questionId,
        selectedIndex,
        lockedAt: new Date().toISOString(),
        isCorrect,
      };

      attempt.lockedAnswers[questionId] = lockedRecord;
      attempt.markedForReview = attempt.markedForReview.filter((id) => id !== questionId);
      if (typeof timeTakenSeconds === 'number' && timeTakenSeconds >= 0) {
        attempt.timeTakenSeconds = Math.max(attempt.timeTakenSeconds, Math.round(timeTakenSeconds));
      }

      sendJson(res, 200, {
        locked: true,
        attempt: sanitizeAttemptForClient(attempt),
      });
      return;
    }

    // 4. Toggle Mark for Review
    if (method === 'POST' && routePath === '/api/quiz/toggle-review') {
      const body = await readJsonBody(req);
      const {
        attemptId,
        questionId,
        serverStateToken,
        lockedAnswersSnapshot,
        markedForReviewSnapshot,
      } = body || {};

      const attempt = resolveServerAttempt(
        attemptId,
        serverStateToken,
        lockedAnswersSnapshot,
        markedForReviewSnapshot
      );
      if (!attempt) {
        sendJson(res, 404, { error: 'Attempt not found.' });
        return;
      }
      if (attempt.status === 'completed' || attempt.lockedAnswers[questionId]) {
        sendJson(res, 409, {
          error: 'Locked questions cannot be modified.',
          attempt: sanitizeAttemptForClient(attempt),
        });
        return;
      }
      if (attempt.markedForReview.includes(questionId)) {
        attempt.markedForReview = attempt.markedForReview.filter((id) => id !== questionId);
      } else {
        attempt.markedForReview.push(questionId);
      }
      sendJson(res, 200, { attempt: sanitizeAttemptForClient(attempt) });
      return;
    }

    // 5. Final Quiz Submission & Official Grading
    if (method === 'POST' && routePath === '/api/quiz/submit') {
      const body = await readJsonBody(req);
      const {
        attemptId,
        timeTakenSeconds = 0,
        serverStateToken,
        lockedAnswersSnapshot,
      } = body || {};

      const attempt = resolveServerAttempt(attemptId, serverStateToken, lockedAnswersSnapshot);
      if (!attempt) {
        sendJson(res, 404, { error: 'Quiz attempt not found on server.' });
        return;
      }

      if (attempt.status !== 'completed') {
        attempt.status = 'completed';
        attempt.completedAt = new Date().toISOString();
        attempt.timeTakenSeconds = Math.max(
          attempt.timeTakenSeconds,
          Math.round(Number(timeTakenSeconds) || 0)
        );
        attempt.scoreSummary = computeScoreSummary(attempt, attempt.timeTakenSeconds);
      }

      sendJson(res, 200, sanitizeAttemptForClient(attempt));
      return;
    }

    // 6. Retrieve / Resume Attempt
    if (method === 'GET' && routePath.startsWith('/api/quiz/attempt/')) {
      const attemptId = routePath.replace('/api/quiz/attempt/', '').trim();
      const attempt = serverAttempts.get(attemptId);
      if (!attempt) {
        sendJson(res, 404, { error: 'Attempt not found.' });
        return;
      }
      sendJson(res, 200, sanitizeAttemptForClient(attempt));
      return;
    }

    // 7. Retake Quiz — Preserves original attempt while generating a 100% FRESH Gemini quiz for the new attempt
    if (method === 'POST' && routePath === '/api/quiz/retake') {
      const body = await readJsonBody(req);
      const {
        originalAttemptId,
        originalConfig,
        originalQuestions = [],
        serverStateToken,
        quizLanguage,
        userId = 'local_student',
        clientExcludedFingerprints = [],
        clientExcludedHistory = [],
      } = body || {};

      const ai = getAiClient();
      if (!ai) {
        logServerError(
          'Missing GEMINI_API_KEY in /api/quiz/retake',
          new Error('GEMINI_API_KEY is not configured in server environment variables.')
        );
        sendJson(res, 503, {
          error:
            'Gemini AI API key is not configured on the server. Please add GEMINI_API_KEY in your Environment Variables and redeploy.',
        });
        return;
      }

      const memOriginal =
        resolveServerAttempt(originalAttemptId, serverStateToken) ||
        serverAttempts.get(originalAttemptId);

      if (!memOriginal && !originalConfig) {
        sendJson(res, 404, { error: 'Original attempt configuration not found.' });
        return;
      }

      const baseConfig = memOriginal ? memOriginal.config : originalConfig;
      const baseQuestions: any[] = memOriginal
        ? memOriginal.questions
        : Array.isArray(originalQuestions)
        ? originalQuestions
        : [];
      const baseAttemptId = memOriginal
        ? memOriginal.attemptId
        : String(originalAttemptId || 'prev');

      const targetLang: 'en' | 'bn' | 'hi' =
        quizLanguage === 'bn' || quizLanguage === 'hi' || quizLanguage === 'en'
          ? quizLanguage
          : baseConfig.quizLanguage || 'en';

      const validClass = [5, 6, 7, 8, 9, 10].includes(Number(baseConfig.classLevel))
        ? Number(baseConfig.classLevel)
        : 8;
      const validCount = [5, 10, 15, 20, 30, 50].includes(Number(baseConfig.questionCount))
        ? Number(baseConfig.questionCount)
        : Math.max(5, baseQuestions.length || 5);
      const cleanUserId = String(userId || 'local_student');

      // Build exclusion history including all questions from the original attempt + persistent history
      const serverHist = getUserServerHistory(cleanUserId);
      const mergedHistoryMap = new Map<string, HistoryComparisonEntry>();

      for (const item of serverHist) {
        if (
          item &&
          item.fingerprint &&
          (!item.classLevel || item.classLevel === validClass) &&
          (!item.subject || item.subject === baseConfig.subject)
        ) {
          mergedHistoryMap.set(item.fingerprint, item);
        }
      }

      for (const oq of baseQuestions) {
        if (oq && typeof oq.questionText === 'string') {
          const fp = oq.fingerprint || computeFingerprint(oq.questionText);
          mergedHistoryMap.set(fp, {
            fingerprint: fp,
            structuralHash: oq.structuralHash || computeStructuralHash(oq.questionText),
            conceptKey: String(oq.conceptKey || ''),
            questionText: oq.questionText,
            options: Array.isArray(oq.options) ? oq.options : undefined,
            classLevel: validClass,
            subject: String(baseConfig.subject),
            topic: String(oq.topic || baseConfig.topic),
            difficulty: String(oq.difficulty || baseConfig.difficulty),
          });
        }
      }

      if (Array.isArray(clientExcludedHistory)) {
        for (const item of clientExcludedHistory) {
          if (item && typeof item.questionText === 'string' && item.questionText.trim()) {
            const fp =
              typeof item.fingerprint === 'string' && item.fingerprint.trim()
                ? item.fingerprint.trim()
                : computeFingerprint(item.questionText);
            mergedHistoryMap.set(fp, {
              fingerprint: fp,
              structuralHash:
                typeof item.structuralHash === 'string' && item.structuralHash.trim()
                  ? item.structuralHash.trim()
                  : computeStructuralHash(item.questionText),
              conceptKey: String(item.conceptKey || ''),
              questionText: item.questionText.trim(),
              options: Array.isArray(item.options) ? item.options.map(String) : undefined,
              classLevel: Number(item.classLevel) || validClass,
              subject: String(item.subject || baseConfig.subject),
              topic: String(item.topic || baseConfig.topic),
              difficulty: String(item.difficulty || baseConfig.difficulty),
            });
          }
        }
      }

      const excludedFingerprintsSet = new Set<string>(mergedHistoryMap.keys());
      if (Array.isArray(clientExcludedFingerprints)) {
        for (const fp of clientExcludedFingerprints) {
          if (typeof fp === 'string' && fp.trim()) excludedFingerprintsSet.add(fp.trim());
        }
      }

      try {
        const requestedMode = normalizeServerQuizMode(body?.mode || baseConfig.mode);
        const resolvedDifficulty =
          requestedMode === 'challenge'
            ? 'hard'
            : String(baseConfig.difficulty || 'mixed');

        const { questions: retakeQuestions, modelUsed, curriculumMeta } =
          await generateFreshVerifiedQuizQuestions({
            ai,
            classLevel: validClass,
            subject: String(baseConfig.subject),
            quizLanguage: targetLang,
            topic: String(baseConfig.topic || 'All Verified Chapters'),
            difficulty: resolvedDifficulty,
            questionCount: validCount,
            questionType: String(baseConfig.questionType || 'mcq'),
            existingHistory: Array.from(mergedHistoryMap.values()),
            excludedFingerprints: excludedFingerprintsSet,
          });

        if (retakeQuestions.length === 0) {
          sendJson(res, 502, {
            error: 'Gemini AI did not return valid questions for the retake. Please retry.',
          });
          return;
        }

        recordQuestionsInServerHistory(cleanUserId, retakeQuestions);

        const timerMap: Record<number, number> = { 5: 3, 10: 7, 15: 10, 20: 15, 30: 25, 50: 45 };
        const resolvedDuration =
          requestedMode === 'practice'
            ? 0
            : timerMap[retakeQuestions.length] ?? timerMap[validCount] ?? 3;

        const newAttemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const newAttempt: ServerQuizAttempt = {
          attemptId: newAttemptId,
          parentAttemptId: baseAttemptId,
          userId: cleanUserId,
          config: {
            ...baseConfig,
            classLevel: validClass,
            quizLanguage: targetLang,
            chapterId: curriculumMeta.chapterId,
            textbookName: curriculumMeta.textbookName,
            board: curriculumMeta.board,
            curriculumVerificationStatus: curriculumMeta.verificationStatus,
            difficulty: resolvedDifficulty,
            questionCount: retakeQuestions.length,
            durationMinutes: resolvedDuration,
            mode: requestedMode,
          },
          questions: retakeQuestions,
          lockedAnswers: {},
          markedForReview: [],
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          timeTakenSeconds: 0,
          generationInfo: {
            model: modelUsed,
            source: 'gemini-ai',
            board: curriculumMeta.board,
            textbookName: curriculumMeta.textbookName,
            syllabusCode: curriculumMeta.syllabusCode,
            verificationStatus: curriculumMeta.verificationStatus,
            excludedHistoryCount: excludedFingerprintsSet.size,
            uniqueConceptsCount: retakeQuestions.length,
            notice: `Fresh Retake of Attempt ${baseAttemptId.slice(-6)} in ${targetLang.toUpperCase()} — Brand-new questions generated.`,
          },
        };

        serverAttempts.set(newAttemptId, newAttempt);
        sendJson(res, 200, sanitizeAttemptForClient(newAttempt));
        return;
      } catch (aiErr: any) {
        logServerError('Gemini retake generation failed in /api/quiz/retake', aiErr);
        const msg = String(aiErr?.message || aiErr || '').toLowerCase();
        if (msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) {
          sendJson(res, 429, {
            error:
              'Gemini AI rate limit reached. Please wait a few seconds and click Retry Quiz Generation.',
          });
          return;
        }
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('unavailable')) {
          sendJson(res, 503, {
            error:
              'Gemini AI is currently experiencing high temporary demand. Please click Retry to generate fresh retake questions.',
          });
          return;
        }
        sendJson(res, 503, {
          error:
            'Unable to reach Gemini AI to generate fresh retake questions. Please click Retry.',
        });
        return;
      }
    }

    // 8. Launch Interactive Locked Quiz from Study Note MCQs
    if (method === 'POST' && routePath === '/api/quiz/from-notes') {
      const body = await readJsonBody(req);
      const {
        mcqs = [],
        classLevel = 8,
        subject = 'life_science',
        quizLanguage = 'en',
        topic = 'Study Notes Revision',
        userId = 'local_student',
      } = body || {};

      if (!Array.isArray(mcqs) || mcqs.length === 0) {
        sendJson(res, 400, { error: 'No MCQs provided to create quiz.' });
        return;
      }

      const validQuizLang: 'en' | 'bn' | 'hi' =
        quizLanguage === 'bn' || quizLanguage === 'hi' ? quizLanguage : 'en';

      const validated: ServerQuestion[] = [];
      for (let i = 0; i < mcqs.length; i++) {
        const v = validateAndNormalizeQuestion(
          { ...mcqs[i], questionType: 'mcq' },
          {
            classLevel: Number(classLevel) || 8,
            subject: String(subject),
            quizLanguage: validQuizLang,
            topic: String(topic),
            difficulty: 'medium',
          },
          i
        );
        if (v) validated.push(v);
      }

      if (validated.length === 0) {
        sendJson(res, 400, { error: 'Could not validate questions from notes.' });
        return;
      }

      recordQuestionsInServerHistory(String(userId), validated);

      const requestedNotesMode = normalizeServerQuizMode(body?.mode || 'practice');
      const timerMap: Record<number, number> = { 5: 3, 10: 7, 15: 10, 20: 15, 30: 25, 50: 45 };
      const notesDuration =
        requestedNotesMode === 'practice'
          ? 0
          : timerMap[validated.length] ?? 7;

      const attemptId = `att_notes_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const attempt: ServerQuizAttempt = {
        attemptId,
        userId: String(userId),
        config: {
          classLevel: Number(classLevel) || 8,
          subject: String(subject),
          quizLanguage: validQuizLang,
          topic: String(topic),
          difficulty: requestedNotesMode === 'challenge' ? 'hard' : 'mixed',
          questionCount: validated.length,
          questionType: 'mcq',
          durationMinutes: notesDuration,
          mode: requestedNotesMode,
        },
        questions: validated,
        lockedAnswers: {},
        markedForReview: [],
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        timeTakenSeconds: 0,
        generationInfo: {
          model: ACTIVE_GEMINI_MODEL,
          source: 'gemini-ai',
          excludedHistoryCount: 0,
          uniqueConceptsCount: validated.length,
          notice: 'Generated directly from your Study Notes.',
        },
      };

      serverAttempts.set(attemptId, attempt);
      sendJson(res, 200, sanitizeAttemptForClient(attempt));
      return;
    }

    // 9. Reset Per-User Question History
    if (method === 'POST' && routePath === '/api/quiz/reset-history') {
      const body = await readJsonBody(req);
      const { userId = 'local_student' } = body || {};
      userHistoryStore.delete(String(userId));
      sendJson(res, 200, { reset: true });
      return;
    }

    // 10. Study Notes & AI Revision Tools Endpoint
    if (method === 'POST' && routePath === '/api/notes/process') {
      const body = await readJsonBody(req);
      const {
        title = 'Study Notes',
        sourceText = '',
        fileData,
        classLevel = 8,
        subject = 'life_science',
        inputLanguage = 'en',
        outputLanguage = 'en',
      } = body || {};

      if ((!sourceText || String(sourceText).trim().length < 10) && !fileData?.base64) {
        sendJson(res, 400, {
          error: 'Please provide study notes text or upload a supported document.',
        });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        logServerError(
          'Missing GEMINI_API_KEY in /api/notes/process',
          new Error('GEMINI_API_KEY is not configured in server environment variables.')
        );
        sendJson(res, 503, {
          error:
            'Gemini AI API key is not configured on the server. Please add GEMINI_API_KEY in your Environment Variables and redeploy.',
        });
        return;
      }

      const outLangName =
        outputLanguage === 'bn'
          ? 'Bengali (বাংলা)'
          : outputLanguage === 'hi'
          ? 'Hindi (हिन्दी)'
          : 'English';

      const inLangName =
        inputLanguage === 'bn'
          ? 'Bengali (বাংলা)'
          : inputLanguage === 'hi'
          ? 'Hindi (हिन्दी)'
          : 'English';

      try {
        const parts: any[] = [];
        if (fileData?.base64 && fileData?.mimeType) {
          parts.push({
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64,
            },
          });
        }
        parts.push({
          text: `Analyze the following Class ${classLevel} (${subject}) study notes (Input Language: ${inLangName}) and produce a complete revision package in ${outLangName} (Output Language code: ${outputLanguage}).
Title: ${title}
Notes Content:
${String(sourceText).slice(0, 18000)}`,
        });

        const { response, modelUsed } = await generateContentWithModelFallback(ai, {
          contents: { parts },
          config: {
            systemInstruction: `You are an expert tutor for Class ${classLevel} students.
Regardless of the input note language (${inLangName}), write all output fields (summary, keyConcepts, flashcards, and 5 unique MCQs) strictly in ${outLangName}.
Make explanations clear, student-friendly, and factually accurate.`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: {
                  type: Type.STRING,
                  description: `Clear, simple-language summary in ${outLangName}`,
                },
                keyConcepts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      example: { type: Type.STRING },
                    },
                    required: ['term', 'explanation', 'example'],
                  },
                },
                flashcards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      front: { type: Type.STRING },
                      back: { type: Type.STRING },
                    },
                    required: ['front', 'back'],
                  },
                },
                mcqs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionText: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      correctIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      topic: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                    },
                    required: [
                      'questionText',
                      'options',
                      'correctIndex',
                      'explanation',
                      'topic',
                      'difficulty',
                    ],
                  },
                },
              },
              required: ['title', 'summary', 'keyConcepts', 'flashcards', 'mcqs'],
            },
          },
        });

        const parsed = parseGeminiJsonSafe(response?.text);
        if (parsed && typeof parsed === 'object' && typeof parsed.summary === 'string') {
          const cleanMcqs = (Array.isArray(parsed.mcqs) ? parsed.mcqs : [])
            .map((m: any, idx: number) => ({
              id: `note_mcq_${Date.now()}_${idx}`,
              questionText: String(m.questionText || ''),
              options: Array.isArray(m.options) ? m.options.slice(0, 4).map(String) : [],
              correctIndex:
                Number.isInteger(m.correctIndex) && m.correctIndex >= 0 && m.correctIndex < 4
                  ? m.correctIndex
                  : 0,
              explanation: String(m.explanation || ''),
              topic: String(m.topic || title),
              difficulty:
                m.difficulty === 'easy' || m.difficulty === 'hard' ? m.difficulty : 'medium',
            }))
            .filter((m: any) => m.questionText.length > 3 && m.options.length === 4);

          sendJson(res, 200, {
            title: parsed.title || title,
            summary: parsed.summary || '',
            keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
            flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
            mcqs: cleanMcqs,
            modelUsed,
          });
          return;
        }
        sendJson(res, 502, {
          error: 'Gemini AI returned an incomplete study notes analysis. Please retry.',
        });
        return;
      } catch (aiErr: any) {
        logServerError('Gemini study notes processing failed', aiErr);
        const msg = String(aiErr?.message || aiErr || '').toLowerCase();
        if (msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) {
          sendJson(res, 429, {
            error: 'Gemini AI rate limit reached. Please wait a few seconds and retry.',
          });
          return;
        }
        sendJson(res, 503, {
          error: 'Unable to process study notes with Gemini AI right now. Please retry.',
        });
        return;
      }
    }

    // 11. AI Chat Feature — Fast Streaming & Standard Gemini AI Response (EN/BN/HI)
    if (method === 'POST' && routePath === '/api/chat/message') {
      const body = await readJsonBody(req);
      const {
        userId = 'local_student',
        chatId = '',
        message = '',
        history = [],
        replyLanguage = 'auto',
        interfaceLanguage = 'en',
        stream = false,
      } = body || {};

      const cleanUserId = String(userId || 'local_student').trim().slice(0, 128) || 'local_student';
      const trimmedMessage = typeof message === 'string' ? message.trim() : '';

      if (!trimmedMessage) {
        sendJson(res, 400, {
          error: 'Please enter a message before sending.',
        });
        return;
      }

      if (trimmedMessage.length > 8000) {
        sendJson(res, 400, {
          error: 'Your message is too long (maximum 8,000 characters). Please shorten it and try again.',
        });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        logServerError(
          'Missing GEMINI_API_KEY in /api/chat/message',
          new Error('GEMINI_API_KEY is not configured in server environment variables.')
        );
        sendJson(res, 503, {
          error:
            'Gemini AI API key is not configured on the server. Please add GEMINI_API_KEY in your Environment Variables and redeploy.',
        });
        return;
      }

      // Detect script of the user's message for natural multilingual responses
      const hasBengaliChars = /[\u0980-\u09FF]/.test(trimmedMessage);
      const hasHindiChars = /[\u0900-\u097F]/.test(trimmedMessage);
      const detectedMsgLang: 'en' | 'bn' | 'hi' = hasBengaliChars
        ? 'bn'
        : hasHindiChars
        ? 'hi'
        : interfaceLanguage === 'bn' || interfaceLanguage === 'hi'
        ? 'en'
        : 'en';

      const targetLang: 'en' | 'bn' | 'hi' =
        replyLanguage === 'bn' || replyLanguage === 'hi' || replyLanguage === 'en'
          ? replyLanguage
          : detectedMsgLang;

      const langRule =
        replyLanguage === 'bn' || hasBengaliChars
          ? 'Reply naturally in Bengali (বাংলা) unless asked for another language.'
          : replyLanguage === 'hi' || hasHindiChars
          ? 'Reply naturally in Hindi (हिन्दी) unless asked for another language.'
          : 'Reply in the same language as the user message (English, Bengali, or Hindi).';

      // Keep conversation context concise and relevant (last 8 messages, max 1200 chars each)
      const safeHistory = Array.isArray(history) ? history.slice(-8) : [];
      const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

      for (const item of safeHistory) {
        if (!item || typeof item.content !== 'string' || !item.content.trim()) continue;
        const role: 'user' | 'model' = item.role === 'assistant' ? 'model' : 'user';
        const text = item.content.trim().slice(0, 1200);
        if (contents.length === 0 && role === 'model') continue;
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `\n\n${text}`;
        } else {
          contents.push({ role, parts: [{ text }] });
        }
      }

      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        if (contents[contents.length - 1].parts[0].text !== trimmedMessage) {
          contents[contents.length - 1].parts[0].text += `\n\n${trimmedMessage}`;
        }
      } else {
        contents.push({ role: 'user', parts: [{ text: trimmedMessage }] });
      }

      // Concise system instruction for low-latency responses
      const systemInstruction = `You are a fast, accurate, and natural AI assistant. Answer the user's exact question directly. Never add unsolicited introductions. ${langRule}`;

      const resolvedChatId =
        typeof chatId === 'string' && chatId.trim()
          ? chatId.trim().replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 100)
          : `chat_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      const persistChatTurn = (rawReply: string, modelUsed: string) => {
        const nowIso = new Date().toISOString();
        const userMsgObj: ServerChatMessage = {
          id: `msg_u_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          role: 'user',
          content: trimmedMessage,
          timestamp: nowIso,
          language: detectedMsgLang,
        };

        const assistantMsgObj: ServerChatMessage = {
          id: `msg_a_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          role: 'assistant',
          content: rawReply,
          timestamp: new Date().toISOString(),
          language: targetLang,
          modelUsed,
        };

        const userChats = getUserChatMap(cleanUserId);
        const existingConv = userChats.get(resolvedChatId);
        const generatedTitle =
          existingConv?.title ||
          trimmedMessage.replace(/\s+/g, ' ').slice(0, 64) +
            (trimmedMessage.length > 64 ? '…' : '');

        const updatedMessages = existingConv
          ? [...existingConv.messages, userMsgObj, assistantMsgObj].slice(-100)
          : [
              ...safeHistory
                .filter((m: any) => m && typeof m.content === 'string' && m.content.trim())
                .map((m: any, idx: number) => ({
                  id: String(m.id || `msg_h_${idx}`),
                  role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
                  content: String(m.content).trim(),
                  timestamp: String(m.timestamp || nowIso),
                  language: (m.language === 'bn' || m.language === 'hi' ? m.language : 'en') as
                    | 'en'
                    | 'bn'
                    | 'hi',
                  modelUsed: m.modelUsed ? String(m.modelUsed) : undefined,
                })),
              userMsgObj,
              assistantMsgObj,
            ].slice(-100);

        const updatedConv: ServerChatConversation = {
          chatId: resolvedChatId,
          userId: cleanUserId,
          title: generatedTitle,
          language: targetLang,
          messages: updatedMessages,
          createdAt: existingConv?.createdAt || nowIso,
          updatedAt: assistantMsgObj.timestamp,
        };

        userChats.set(resolvedChatId, updatedConv);

        return {
          chatId: resolvedChatId,
          title: generatedTitle,
          userMessage: userMsgObj,
          assistantMessage: assistantMsgObj,
          modelUsed,
        };
      };

      const wantStream =
        Boolean(stream) || String(req.headers?.accept || '').includes('text/event-stream');

      if (wantStream) {
        let headersSent = false;
        const ensureSseHeaders = () => {
          if (headersSent) return;
          headersSent = true;
          res.statusCode = 200;
          if (typeof res.setHeader === 'function') {
            res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');
          }
          if (typeof res.flushHeaders === 'function') {
            res.flushHeaders();
          }
        };

        const writeSse = (payload: Record<string, any>) => {
          ensureSseHeaders();
          const line = `data: ${JSON.stringify(payload)}\n\n`;
          if (typeof res.write === 'function') {
            res.write(line);
          }
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        };

        const chatModels = getOrderedCandidateModels();

        let lastErr: any = null;

        for (let i = 0; i < chatModels.length; i++) {
          const modelName = chatModels[i];
          try {
            const thinkingConfig =
              modelName === 'gemini-3-flash-preview' || modelName === 'gemini-3.8-flash'
                ? { thinkingLevel: ThinkingLevel.LOW }
                : modelName.startsWith('gemini-2.5') ||
                  modelName === 'gemini-flash-latest' ||
                  modelName === 'gemini-flash-lite-latest'
                ? { thinkingBudget: 0 }
                : undefined;

            const streamResponse = await withTimeout(
              ai.models.generateContentStream({
                model: modelName,
                contents,
                config: {
                  systemInstruction,
                  temperature: 0.7,
                  ...(thinkingConfig ? { thinkingConfig } : {}),
                },
              }),
              15000,
              `Gemini generateContentStream (${modelName})`
            );

            let accumulated = '';
            for await (const chunk of streamResponse) {
              const delta = typeof chunk?.text === 'string' ? chunk.text : '';
              if (delta) {
                accumulated += delta;
                writeSse({ type: 'delta', text: delta });
              }
            }

            const finalReply = accumulated.trim();
            if (!finalReply) {
              throw new Error('Gemini AI returned an empty stream.');
            }

            modelCooldownUntil.delete(modelName);
            const savedPayload = persistChatTurn(finalReply, modelName);
            writeSse({
              type: 'done',
              ...savedPayload,
            });
            if (typeof res.end === 'function') {
              res.end();
            }
            return;
          } catch (streamErr: any) {
            lastErr = streamErr;
            const msg = String(streamErr?.message || streamErr || '').toLowerCase();
            recordModelFailureCooldown(modelName, streamErr);
            // Only stop fallback loop if SSE chunks were already sent or if the API key itself is invalid
            if (
              headersSent ||
              msg.includes('api_key_invalid') ||
              msg.includes('api key not valid')
            ) {
              break;
            }
          }
        }

        logServerError('Gemini AI Chat stream failed in /api/chat/message', lastErr);
        const errMsg = String(lastErr?.message || lastErr || '').toLowerCase();
        const isInvalidKey =
          errMsg.includes('api_key_invalid') || errMsg.includes('api key not valid');
        const isRateLimit =
          errMsg.includes('429') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('quota');

        const clientErrorText = isInvalidKey
          ? 'The configured GEMINI_API_KEY on the server was rejected as invalid. Please verify GEMINI_API_KEY in your Environment Variables and redeploy.'
          : isRateLimit
          ? 'Gemini AI rate limit reached. Please wait a few seconds and retry your message.'
          : 'Unable to reach Gemini AI right now. Please check your connection or retry in a moment.';

        if (!headersSent) {
          sendJson(res, isRateLimit ? 429 : 503, { error: clientErrorText });
        } else {
          writeSse({ type: 'error', error: clientErrorText });
          if (typeof res.end === 'function') {
            res.end();
          }
        }
        return;
      }

      try {
        const { response, modelUsed } = await generateContentWithModelFallback(ai, {
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const rawReply = typeof response?.text === 'string' ? response.text.trim() : '';
        if (!rawReply) {
          sendJson(res, 502, {
            error: 'Gemini AI returned an empty response. Please try sending your message again.',
          });
          return;
        }

        const savedPayload = persistChatTurn(rawReply, modelUsed);
        sendJson(res, 200, savedPayload);
        return;
      } catch (aiErr: any) {
        logServerError('Gemini AI Chat failed in /api/chat/message', aiErr);
        const msg = String(aiErr?.message || aiErr || '').toLowerCase();
        if (msg.includes('api_key_invalid') || msg.includes('api key not valid')) {
          sendJson(res, 503, {
            error:
              'The configured GEMINI_API_KEY on the server was rejected as invalid. Please verify GEMINI_API_KEY in your Environment Variables and redeploy.',
          });
          return;
        }
        if (msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) {
          sendJson(res, 429, {
            error:
              'Gemini AI rate limit reached. Please wait a few seconds and retry your message.',
          });
          return;
        }
        sendJson(res, 503, {
          error:
            'Unable to reach Gemini AI right now. Please check your connection or retry in a moment.',
        });
        return;
      }
    }

    // 12. AI Chat History — Fetch Per-User Private Conversations from Server Store
    if (method === 'POST' && routePath === '/api/chat/history') {
      const body = await readJsonBody(req);
      const cleanUserId =
        String(body?.userId || 'local_student').trim().slice(0, 128) || 'local_student';
      const userChats = getUserChatMap(cleanUserId);
      const list = Array.from(userChats.values()).sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
      );
      sendJson(res, 200, {
        userId: cleanUserId,
        conversations: list,
      });
      return;
    }

    // 13. AI Chat Delete / Clear History (Per-User Isolated)
    if (method === 'POST' && routePath === '/api/chat/delete') {
      const body = await readJsonBody(req);
      const cleanUserId =
        String(body?.userId || 'local_student').trim().slice(0, 128) || 'local_student';
      const { chatId, clearAll } = body || {};
      const userChats = getUserChatMap(cleanUserId);
      if (clearAll) {
        userChats.clear();
      } else if (typeof chatId === 'string' && chatId.trim()) {
        userChats.delete(chatId.trim());
      }
      sendJson(res, 200, { deleted: true });
      return;
    }

    sendJson(res, 404, {
      error: `API route not found: ${method} ${routePath}`,
    });
  } catch (err: any) {
    logServerError('Unhandled top-level API error', err);
    sendJson(res, 500, {
      error: err?.message || 'An unexpected server error occurred while processing your request.',
    });
  }
}
