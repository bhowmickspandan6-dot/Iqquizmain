import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';

// Official supported Gemini Flash models (fast, free-tier eligible, structured JSON output supported)
const SUPPORTED_GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-3-flash-preview'];
const configuredModel = (process.env.GEMINI_MODEL || '').trim();
const ACTIVE_GEMINI_MODEL = SUPPORTED_GEMINI_MODELS.includes(configuredModel)
  ? configuredModel
  : 'gemini-2.5-flash';

// Timeout per Gemini call so Vercel Serverless Functions never hit gateway 504/500 timeouts
const GEMINI_TIMEOUT_MS = 8000;

export const config = {
  maxDuration: 30,
};

function logServerError(context: string, err: any, extra?: Record<string, any>) {
  const safeDetails = {
    timestamp: new Date().toISOString(),
    context,
    name: err?.name || 'Error',
    message: err?.message || String(err),
    status: err?.status || err?.statusCode || undefined,
    code: err?.code || undefined,
    ...(extra || {}),
  };
  console.error(`[IQ Quiz Server Error] ${context}:`, JSON.stringify(safeDetails));
}

function getServerApiKey(): string {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
  ];
  for (const raw of candidates) {
    if (typeof raw === 'string') {
      const cleaned = raw.replace(/^["']|["']$/g, '').trim();
      if (cleaned && cleaned !== 'MY_GEMINI_API_KEY' && cleaned.length > 10) {
        return cleaned;
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
    return new GoogleGenAI({ apiKey });
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

async function generateContentWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
): Promise<{ response: any; modelUsed: string }> {
  const candidateModels = Array.from(
    new Set([ACTIVE_GEMINI_MODEL, ...SUPPORTED_GEMINI_MODELS])
  );
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        }),
        GEMINI_TIMEOUT_MS,
        `Gemini generateContent (${modelName})`
      );
      return { response, modelUsed: modelName };
    } catch (err: any) {
      lastError = err;
      logServerError(`Gemini model ${modelName} call failed`, err, { modelName });
      const msg = String(err?.message || err || '').toLowerCase();
      if (
        msg.includes('429') ||
        msg.includes('resource_exhausted') ||
        msg.includes('quota') ||
        msg.includes('api_key_invalid') ||
        msg.includes('timed out')
      ) {
        break;
      }
    }
  }
  throw lastError || new Error('Gemini API request failed.');
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

// Universal HTTP helpers that work in Vercel Serverless Functions, Express, and raw Node HTTP
function sendJson(res: any, statusCode: number, payload: any) {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  if (typeof res.end === 'function') {
    res.end(body);
  } else if (typeof res.json === 'function') {
    res.status(statusCode).json(payload);
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

  // Check if Vercel rewrite passed __path query parameter
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

// In-memory rate limiting per user/IP (protects free-tier quota)
const rateLimitWindowMs = 60 * 1000;
const maxRequestsPerMinute = 25;
const requestCounters = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = requestCounters.get(key);
  if (!entry || now > entry.resetAt) {
    requestCounters.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return { allowed: true };
  }
  if (entry.count >= maxRequestsPerMinute) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  entry.count += 1;
  return { allowed: true };
}

function computeFingerprint(text: string): string {
  const normalized = (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

const userFingerprintsHistory = new Map<string, Set<string>>();
const userConceptHistory = new Map<string, Set<string>>();

function getUserHistory(userId: string) {
  if (!userFingerprintsHistory.has(userId)) {
    userFingerprintsHistory.set(userId, new Set<string>());
  }
  if (!userConceptHistory.has(userId)) {
    userConceptHistory.set(userId, new Set<string>());
  }
  return {
    fingerprints: userFingerprintsHistory.get(userId)!,
    concepts: userConceptHistory.get(userId)!,
  };
}

interface ServerQuestion {
  id: string;
  fingerprint: string;
  conceptKey: string;
  classLevel: number;
  subject: string;
  topic: string;
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

interface ServerQuizAttempt {
  attemptId: string;
  parentAttemptId?: string;
  userId: string;
  config: {
    classLevel: number;
    subject: string;
    quizLanguage: 'en' | 'bn' | 'hi';
    topic: string;
    difficulty: string;
    questionCount: number;
    questionType: string;
    durationMinutes: number;
    mode: 'practice' | 'test';
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
    excludedHistoryCount: number;
    uniqueConceptsCount: number;
    notice?: string;
  };
}

const serverAttempts = new Map<string, ServerQuizAttempt>();

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
  const isPractice = attempt.config.mode === 'practice';

  const clientQuestions = attempt.questions.map((q) => {
    const isQuestionLocked = Boolean(attempt.lockedAnswers[q.id]);
    const revealAnswer = isCompleted || (isPractice && isQuestionLocked);

    return {
      id: q.id,
      fingerprint: q.fingerprint,
      conceptKey: q.conceptKey,
      classLevel: q.classLevel,
      subject: q.subject,
      topic: q.topic,
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
    const revealAnswer = isCompleted || isPractice;
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

  const correctIndex = Number(raw.correctIndex);
  if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= options.length
  ) {
    return null;
  }

  const explanation =
    typeof raw.explanation === 'string' && raw.explanation.trim().length > 5
      ? raw.explanation.trim()
      : config.quizLanguage === 'bn'
      ? `সঠিক উত্তর হলো "${options[correctIndex]}" কারণ এটি পাঠ্যক্রমের তথ্যের সাথে সামঞ্জস্যপূর্ণ।`
      : config.quizLanguage === 'hi'
      ? `सही उत्तर "${options[correctIndex]}" है क्योंकि यह पाठ्यक्रम के सिद्धांत के अनुरूप है।`
      : `The correct answer is "${options[correctIndex]}" based on verified curriculum principles.`;

  const fp = computeFingerprint(raw.questionText);
  const conceptKey =
    typeof raw.conceptKey === 'string' && raw.conceptKey.trim().length > 2
      ? raw.conceptKey
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .slice(0, 64)
      : `${config.subject}_c${config.classLevel}_${fp.slice(0, 8)}`;

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

  return {
    id: `q_${config.classLevel}_${config.subject}_${fp}_${index}`,
    fingerprint: fp,
    conceptKey,
    classLevel: config.classLevel,
    subject: config.subject,
    topic:
      typeof raw.topic === 'string' && raw.topic.trim().length > 2
        ? raw.topic.trim()
        : config.topic || 'Core Curriculum',
    difficulty: diff,
    language: config.quizLanguage,
    questionType: qType,
    questionText: raw.questionText.trim(),
    options,
    correctIndex,
    explanation,
    hint:
      typeof raw.hint === 'string' && raw.hint.trim().length > 2
        ? raw.hint.trim()
        : undefined,
  };
}

function generateVerifiedCurriculumQuestions(
  config: {
    classLevel: number;
    subject: string;
    quizLanguage: 'en' | 'bn' | 'hi';
    topic: string;
    difficulty: string;
    questionCount: number;
    questionType: string;
  },
  excludedFingerprints: Set<string>,
  excludedConcepts: Set<string>
): ServerQuestion[] {
  const results: ServerQuestion[] = [];
  const lang = config.quizLanguage;
  const cls = config.classLevel;
  const subj = config.subject;

  const addCandidate = (q: {
    conceptKey: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questionType: 'mcq' | 'tf';
    en: { q: string; opts: string[]; ans: number; exp: string; hint?: string };
    bn: { q: string; opts: string[]; ans: number; exp: string; hint?: string };
    hi: { q: string; opts: string[]; ans: number; exp: string; hint?: string };
  }) => {
    if (results.length >= config.questionCount) return;
    const localized = q[lang] || q.en;
    const fp = computeFingerprint(localized.q);
    if (excludedFingerprints.has(fp) || excludedConcepts.has(q.conceptKey)) {
      return;
    }
    excludedFingerprints.add(fp);
    excludedConcepts.add(q.conceptKey);
    results.push({
      id: `q_${cls}_${subj}_${fp}_${results.length}`,
      fingerprint: fp,
      conceptKey: q.conceptKey,
      classLevel: cls,
      subject: subj,
      topic: q.topic,
      difficulty: q.difficulty,
      language: lang,
      questionType: q.questionType,
      questionText: localized.q,
      options: localized.opts,
      correctIndex: localized.ans,
      explanation: localized.exp,
      hint: localized.hint,
    });
  };

  const seedOffset = Math.floor(Math.random() * 50) + excludedFingerprints.size * 3;

  if (subj === 'mathematics') {
    for (let i = 0; i < config.questionCount + 25; i++) {
      const n = seedOffset + i + 2;
      const variant = i % 5;

      if (variant === 0) {
        const l = n + 4;
        const w = n + 1;
        const perim = 2 * (l + w);
        const area = l * w;
        addCandidate({
          conceptKey: `math_c${cls}_rect_perim_${l}_${w}`,
          topic: config.topic || `Class ${cls} Mensuration & Geometry`,
          difficulty: 'easy',
          questionType: 'mcq',
          en: {
            q: `For a Class ${cls} geometry exercise, a rectangular field has a length of ${l} m and a breadth of ${w} m. What is its perimeter?`,
            opts: [`${perim} m`, `${area} m`, `${l + w} m`, `${perim + 6} m`],
            ans: 0,
            exp: `Perimeter of a rectangle = 2 × (length + breadth) = 2 × (${l} + ${w}) = 2 × ${l + w} = ${perim} m.`,
            hint: 'Use the formula Perimeter = 2 × (Length + Breadth).',
          },
          bn: {
            q: `শ্রেণি ${cls}-এর জ্যামিতি অনুশীলনী অনুযায়ী, একটি আয়তাকার মাঠের দৈর্ঘ্য ${l} মিটার এবং প্রস্থ ${w} মিটার হলে, মাঠটির পরিসীমা কত?`,
            opts: [`${perim} মিটার`, `${area} মিটার`, `${l + w} মিটার`, `${perim + 6} মিটার`],
            ans: 0,
            exp: `আয়তক্ষেত্রের পরিসীমা = ২ × (দৈর্ঘ্য + প্রস্থ) = ২ × (${l} + ${w}) = ২ × ${l + w} = ${perim} মিটার।`,
            hint: 'পরিসীমা = ২ × (দৈর্ঘ্য + প্রস্থ) সূত্রটি ব্যবহার করো।',
          },
          hi: {
            q: `कक्षा ${cls} के ज्यामिति अभ्यास के अनुसार, एक आयताकार मैदान की लंबाई ${l} मीटर और चौड़ाई ${w} मीटर है। इसका परिमाप क्या है?`,
            opts: [`${perim} मीटर`, `${area} मीटर`, `${l + w} मीटर`, `${perim + 6} मीटर`],
            ans: 0,
            exp: `आयत का परिमाप = 2 × (लंबाई + चौड़ाई) = 2 × (${l} + ${w}) = 2 × ${l + w} = ${perim} मीटर।`,
            hint: 'परिमाप = 2 × (लंबाई + चौड़ाई) सूत्र का प्रयोग करें।',
          },
        });
      } else if (variant === 1) {
        const xVal = (i % 12) + 3;
        const a = (cls % 4) + 2;
        const b = n + 5;
        const rhs = a * xVal + b;
        addCandidate({
          conceptKey: `math_c${cls}_linear_eq_${a}_${b}_${rhs}`,
          topic: config.topic || `Class ${cls} Algebra & Linear Equations`,
          difficulty: 'medium',
          questionType: 'mcq',
          en: {
            q: `Solve the linear equation for x: ${a}x + ${b} = ${rhs}.`,
            opts: [`x = ${xVal}`, `x = ${xVal + 2}`, `x = ${xVal - 1}`, `x = ${xVal + 4}`],
            ans: 0,
            exp: `Subtracting ${b} from both sides gives ${a}x = ${rhs - b}. Dividing both sides by ${a} gives x = ${rhs - b} / ${a} = ${xVal}.`,
            hint: `First subtract ${b} from ${rhs}, then divide by ${a}.`,
          },
          bn: {
            q: `সমীকরণটি সমাধান করে x-এর মান নির্ণয় করো: ${a}x + ${b} = ${rhs}।`,
            opts: [`x = ${xVal}`, `x = ${xVal + 2}`, `x = ${xVal - 1}`, `x = ${xVal + 4}`],
            ans: 0,
            exp: `উভয় পক্ষ থেকে ${b} বিয়োগ করলে পাই ${a}x = ${rhs - b}। এরপর ${a} দিয়ে ভাগ করলে পাই x = ${rhs - b} ÷ ${a} = ${xVal}।`,
            hint: `প্রথমে ${rhs} থেকে ${b} বিয়োগ করো, তারপর ${a} দিয়ে ভাগ করো।`,
          },
          hi: {
            q: `रैखिक समीकरण को हल करके x का मान ज्ञात कीजिए: ${a}x + ${b} = ${rhs}।`,
            opts: [`x = ${xVal}`, `x = ${xVal + 2}`, `x = ${xVal - 1}`, `x = ${xVal + 4}`],
            ans: 0,
            exp: `दोनों पक्षों से ${b} घटाने पर ${a}x = ${rhs - b} प्राप्त होता है। ${a} से भाग देने पर x = ${rhs - b} ÷ ${a} = ${xVal}।`,
            hint: `पहले ${rhs} में से ${b} घटाएं, फिर ${a} से भाग दें।`,
          },
        });
      } else if (variant === 2) {
        const p = ((i % 9) + 2) * 500;
        const r = (cls % 5) + 4;
        const t = 2;
        const si = (p * r * t) / 100;
        addCandidate({
          conceptKey: `math_c${cls}_simple_interest_${p}_${r}_${t}`,
          topic: config.topic || `Class ${cls} Arithmetic & Commercial Math`,
          difficulty: 'medium',
          questionType: 'mcq',
          en: {
            q: `Calculate the Simple Interest on a principal of ₹${p} at ${r}% per annum for ${t} years.`,
            opts: [`₹${si}`, `₹${si + 50}`, `₹${si * 2}`, `₹${Math.max(10, si - 40)}`],
            ans: 0,
            exp: `Simple Interest (SI) = (P × R × T) / 100 = (${p} × ${r} × ${t}) / 100 = ₹${si}.`,
            hint: 'Use SI = (Principal × Rate × Time) ÷ 100.',
          },
          bn: {
            q: `বার্ষিক ${r}% সরল সুদের হারে ₹${p} আসলের ${t} বছরের সরল সুদ কত হবে?`,
            opts: [`₹${si}`, `₹${si + 50}`, `₹${si * 2}`, `₹${Math.max(10, si - 40)}`],
            ans: 0,
            exp: `সরল সুদ (I) = (P × R × T) / 100 = (${p} × ${r} × ${t}) / 100 = ₹${si}।`,
            hint: 'সরল সুদ = (আসল × সুদের হার × সময়) ÷ ১০০ সূত্রটি প্রয়োগ করো।',
          },
          hi: {
            q: `₹${p} के मूलधन पर ${r}% वार्षिक दर से ${t} वर्षों का साधारण ब्याज ज्ञात कीजिए।`,
            opts: [`₹${si}`, `₹${si + 50}`, `₹${si * 2}`, `₹${Math.max(10, si - 40)}`],
            ans: 0,
            exp: `साधारण ब्याज (SI) = (मूलधन × दर × समय) / 100 = (${p} × ${r} × ${t}) / 100 = ₹${si}।`,
            hint: 'साधारण ब्याज = (P × R × T) ÷ 100 सूत्र का उपयोग करें।',
          },
        });
      } else if (variant === 3) {
        const a1 = 45 + (i % 35);
        const a2 = 50 + ((i * 3) % 30);
        const a3 = 180 - (a1 + a2);
        addCandidate({
          conceptKey: `math_c${cls}_triangle_angle_${a1}_${a2}`,
          topic: config.topic || `Class ${cls} Triangles & Angle Properties`,
          difficulty: 'easy',
          questionType: 'mcq',
          en: {
            q: `Two interior angles of a triangle measure ${a1}° and ${a2}°. What is the measure of the third interior angle?`,
            opts: [`${a3}°`, `${a3 + 10}°`, `${Math.max(5, a3 - 10)}°`, `${180 - a1}°`],
            ans: 0,
            exp: `The sum of interior angles of a triangle is always 180°. Therefore, the third angle = 180° - (${a1}° + ${a2}°) = 180° - ${a1 + a2}° = ${a3}°.`,
            hint: 'The three interior angles of any triangle add up to 180°.',
          },
          bn: {
            q: `একটি ত্রিভুজের দুটি অন্তঃকোণের পরিমাপ ${a1}° এবং ${a2}° হলে, তৃতীয় কোণটির পরিমাপ কত?`,
            opts: [`${a3}°`, `${a3 + 10}°`, `${Math.max(5, a3 - 10)}°`, `${180 - a1}°`],
            ans: 0,
            exp: `ত্রিভুজের তিনটি কোণের সমষ্টি ১৮০°। সুতরাং তৃতীয় কোণ = ১৮০° - (${a1}° + ${a2}°) = ১৮০° - ${a1 + a2}° = ${a3}°।`,
            hint: 'ত্রিভুজের তিন কোণের সমষ্টি সর্বদা ১৮০°।',
          },
          hi: {
            q: `एक त्रिभुज के दो अंतः कोण ${a1}° और ${a2}° हैं। तीसरे कोण का मान क्या होगा?`,
            opts: [`${a3}°`, `${a3 + 10}°`, `${Math.max(5, a3 - 10)}°`, `${180 - a1}°`],
            ans: 0,
            exp: `त्रिभुज के तीनों अंतः कोणों का योग 180° होता है। अतः तीसरा कोण = 180° - (${a1}° + ${a2}°) = 180° - ${a1 + a2}° = ${a3}°।`,
            hint: 'त्रिभुज के तीनों कोणों का योग 180° होता है।',
          },
        });
      } else {
        const k = (i % 6) + 2;
        const r1 = 3;
        const r2 = 5;
        const total = (r1 + r2) * k * 4;
        const part1 = r1 * k * 4;
        addCandidate({
          conceptKey: `math_c${cls}_ratio_division_${total}_${r1}_${r2}`,
          topic: config.topic || `Class ${cls} Ratio & Proportion`,
          difficulty: 'hard',
          questionType: 'mcq',
          en: {
            q: `If ${total} books are divided between two school libraries in the ratio ${r1}:${r2}, how many books does the first library receive?`,
            opts: [`${part1}`, `${total - part1}`, `${part1 + 4}`, `${part1 - 4}`],
            ans: 0,
            exp: `Sum of ratio terms = ${r1} + ${r2} = ${r1 + r2}. First library's share = (${r1} / ${r1 + r2}) × ${total} = ${part1} books.`,
            hint: `Divide ${total} by (${r1} + ${r2}) and multiply by ${r1}.`,
          },
          bn: {
            q: `যদি ${total}টি বই দুটি বিদ্যালয়ের গ্রন্থাগারের মধ্যে ${r1}:${r2} অনুপাতে ভাগ করে দেওয়া হয়, তবে প্রথম গ্রন্থাগারটি কয়টি বই পাবে?`,
            opts: [`${part1}টি`, `${total - part1}টি`, `${part1 + 4}টি`, `${part1 - 4}টি`],
            ans: 0,
            exp: `অনুপাতের পদদ্বয়ের সমষ্টি = ${r1} + ${r2} = ${r1 + r2}। প্রথম গ্রন্থাগারের অংশ = (${r1} / ${r1 + r2}) × ${total} = ${part1}টি বই।`,
            hint: `মোট সংখ্যাকে (${r1} + ${r2}) দিয়ে ভাগ করে ${r1} দিয়ে গুণ করো।`,
          },
          hi: {
            q: `यदि ${total} पुस्तकों को दो विद्यालय पुस्तकालयों के बीच ${r1}:${r2} के अनुपात में बांटा जाता है, तो पहले पुस्तकालय को कितनी पुस्तकें मिलेंगी?`,
            opts: [`${part1}`, `${total - part1}`, `${part1 + 4}`, `${part1 - 4}`],
            ans: 0,
            exp: `अनुपात पदों का योग = ${r1} + ${r2} = ${r1 + r2}। पहले पुस्तकालय का भाग = (${r1} / ${r1 + r2}) × ${total} = ${part1} पुस्तकें।`,
            hint: `${total} को (${r1} + ${r2}) से भाग देकर ${r1} से गुणा करें।`,
          },
        });
      }
    }
  } else if (subj === 'physical_science') {
    for (let i = 0; i < config.questionCount + 25; i++) {
      const n = seedOffset + i + 2;
      const variant = i % 4;
      if (variant === 0) {
        const current = (i % 5) + 2;
        const resistance = (cls % 6) + 3 + (i % 4);
        const voltage = current * resistance;
        addCandidate({
          conceptKey: `phys_c${cls}_ohms_law_${current}_${resistance}`,
          topic: config.topic || `Class ${cls} Current Electricity & Ohm's Law`,
          difficulty: 'medium',
          questionType: 'mcq',
          en: {
            q: `According to Ohm's Law, if an electric current of ${current} A flows through a resistor of ${resistance} Ω, what is the potential difference (voltage) across it?`,
            opts: [`${voltage} V`, `${voltage + 5} V`, `${resistance + current} V`, `${Math.max(1, resistance - current)} V`],
            ans: 0,
            exp: `By Ohm's Law, V = I × R = ${current} A × ${resistance} Ω = ${voltage} V.`,
            hint: 'Use the formula V = I × R.',
          },
          bn: {
            q: `ওহমের সূত্রানুসারে, ${resistance} Ω রোধের একটি পরিবাহীর মধ্য দিয়ে ${current} A তড়িৎ প্রবাহিত হলে পরিবাহীর দুই প্রান্তের বিভবপ্রভেদ কত হবে?`,
            opts: [`${voltage} V`, `${voltage + 5} V`, `${resistance + current} V`, `${Math.max(1, resistance - current)} V`],
            ans: 0,
            exp: `ওহমের সূত্র অনুযায়ী, V = I × R = ${current} A × ${resistance} Ω = ${voltage} V।`,
            hint: 'V = I × R সূত্রটি ব্যবহার করো।',
          },
          hi: {
            q: `ओम के नियम के अनुसार, यदि ${resistance} Ω के प्रतिरोधक से ${current} A की विद्युत धारा प्रवाहित होती है, तो उसके सिरों के बीच विभवांतर (वोल्टेज) क्या होगा?`,
            opts: [`${voltage} V`, `${voltage + 5} V`, `${resistance + current} V`, `${Math.max(1, resistance - current)} V`],
            ans: 0,
            exp: `ओम के नियम से, V = I × R = ${current} A × ${resistance} Ω = ${voltage} V।`,
            hint: 'सूत्र V = I × R का प्रयोग करें।',
          },
        });
      } else if (variant === 1) {
        const mass = (i % 7) + 2;
        const acc = (i % 4) + 3;
        const force = mass * acc;
        addCandidate({
          conceptKey: `phys_c${cls}_newton_force_${mass}_${acc}`,
          topic: config.topic || `Class ${cls} Force & Laws of Motion`,
          difficulty: 'easy',
          questionType: 'mcq',
          en: {
            q: `What net force in Newtons is required to give a body of mass ${mass} kg an acceleration of ${acc} m/s²?`,
            opts: [`${force} N`, `${mass + acc} N`, `${force * 2} N`, `${Math.max(1, force - 3)} N`],
            ans: 0,
            exp: `By Newton's Second Law of Motion, Force (F) = mass (m) × acceleration (a) = ${mass} kg × ${acc} m/s² = ${force} N.`,
            hint: 'Force = Mass × Acceleration.',
          },
          bn: {
            q: `${mass} kg ভরের কোনো বস্তুর ওপর কত বল প্রযুক্ত হলে বস্তুটিতে ${acc} m/s² ত্বরণ সৃষ্টি হবে?`,
            opts: [`${force} N`, `${mass + acc} N`, `${force * 2} N`, `${Math.max(1, force - 3)} N`],
            ans: 0,
            exp: `নিউটনের দ্বিতীয় গতিসূত্র অনুযায়ী, বল (F) = ভর (m) × ত্বরণ (a) = ${mass} kg × ${acc} m/s² = ${force} N।`,
            hint: 'বল = ভর × ত্বরণ সূত্রটি প্রয়োগ করো।',
          },
          hi: {
            q: `${mass} kg द्रव्यमान की किसी वस्तु में ${acc} m/s² का त्वरण उत्पन्न करने के लिए कितने न्यूटन बल की आवश्यकता होगी?`,
            opts: [`${force} N`, `${mass + acc} N`, `${force * 2} N`, `${Math.max(1, force - 3)} N`],
            ans: 0,
            exp: `न्यूटन के गति के द्वितीय नियम के अनुसार, बल (F) = द्रव्यमान (m) × त्वरण (a) = ${mass} kg × ${acc} m/s² = ${force} N।`,
            hint: 'बल = द्रव्यमान × त्वरण सूत्र का उपयोग करें।',
          },
        });
      } else if (variant === 2) {
        const dist = ((i % 6) + 3) * 20;
        const time = 4;
        const speed = dist / time;
        addCandidate({
          conceptKey: `phys_c${cls}_kinematics_speed_${dist}_${time}`,
          topic: config.topic || `Class ${cls} Motion & Kinematics`,
          difficulty: 'easy',
          questionType: 'mcq',
          en: {
            q: `An object travels a distance of ${dist} meters uniformly in ${time} seconds. What is its speed?`,
            opts: [`${speed} m/s`, `${speed + 5} m/s`, `${dist * time} m/s`, `${Math.max(2, speed - 4)} m/s`],
            ans: 0,
            exp: `Speed = Distance / Time = ${dist} m / ${time} s = ${speed} m/s.`,
            hint: 'Divide total distance by time taken.',
          },
          bn: {
            q: `একটি বস্তু সমদ্রুতিতে ${time} সেকেন্ডে ${dist} মিটার দূরত্ব অতিক্রম করলে তার দ্রুতি কত?`,
            opts: [`${speed} m/s`, `${speed + 5} m/s`, `${dist * time} m/s`, `${Math.max(2, speed - 4)} m/s`],
            ans: 0,
            exp: `দ্রুতি = অতিক্রান্ত দূরত্ব ÷ সময় = ${dist} m ÷ ${time} s = ${speed} m/s।`,
            hint: 'দূরত্বকে সময় দিয়ে ভাগ করো।',
          },
          hi: {
            q: `एक वस्तु समान चाल से ${time} सेकंड में ${dist} मीटर की दूरी तय करती है। उसकी चाल क्या है?`,
            opts: [`${speed} m/s`, `${speed + 5} m/s`, `${dist * time} m/s`, `${Math.max(2, speed - 4)} m/s`],
            ans: 0,
            exp: `चाल = दूरी ÷ समय = ${dist} m ÷ ${time} s = ${speed} m/s।`,
            hint: 'कुल दूरी को समय से विभाजित करें।',
          },
        });
      } else {
        const z = (n % 18) + 1;
        const neutrons = z + (n % 3);
        const massNum = z + neutrons;
        addCandidate({
          conceptKey: `phys_c${cls}_atomic_mass_${z}_${neutrons}`,
          topic: config.topic || `Class ${cls} Atomic Structure & Matter`,
          difficulty: 'hard',
          questionType: 'mcq',
          en: {
            q: `An atom of an element has ${z} protons and ${neutrons} neutrons in its nucleus. What is its mass number (A)?`,
            opts: [`${massNum}`, `${z}`, `${neutrons}`, `${massNum + z}`],
            ans: 0,
            exp: `Mass Number (A) = Number of protons (Z) + Number of neutrons (N) = ${z} + ${neutrons} = ${massNum}.`,
            hint: 'Mass number is the total of protons and neutrons in the nucleus.',
          },
          bn: {
            q: `কোনো মৌলের পরমাণুর নিউক্লিয়াসে ${z}টি প্রোটন এবং ${neutrons}টি নিউট্রন থাকলে ওই পরমাণুটির ভরসংখ্যা (A) কত?`,
            opts: [`${massNum}`, `${z}`, `${neutrons}`, `${massNum + z}`],
            ans: 0,
            exp: `ভরসংখ্যা (A) = প্রোটন সংখ্যা (Z) + নিউট্রন সংখ্যা (N) = ${z} + ${neutrons} = ${massNum}।`,
            hint: 'ভরসংখ্যা = প্রোটন সংখ্যা + নিউট্রন সংখ্যা।',
          },
          hi: {
            q: `किसी तत्व के परमाणु के नाभिक में ${z} प्रोटॉन और ${neutrons} न्यूट्रॉन हैं। इसकी द्रव्यमान संख्या (A) क्या है?`,
            opts: [`${massNum}`, `${z}`, `${neutrons}`, `${massNum + z}`],
            ans: 0,
            exp: `द्रव्यमान संख्या (A) = प्रोटॉनों की संख्या (Z) + न्यूट्रॉनों की संख्या (N) = ${z} + ${neutrons} = ${massNum}।`,
            hint: 'द्रव्यमान संख्या प्रोटॉन और न्यूट्रॉन के योग के बराबर होती है।',
          },
        });
      }
    }
  } else {
    // Rich multilingual bank for life_science, bangla, english, hindi, and gk
    const bankItems = [
      {
        key: 'mitochondria_atp',
        en: {
          q: 'Which cell organelle is known as the powerhouse of the cell because it synthesizes ATP through cellular respiration?',
          opts: ['Mitochondria', 'Ribosome', 'Golgi apparatus', 'Lysosome'],
          ans: 0,
          exp: 'Mitochondria generate most of the chemical energy (ATP) needed to power the cell’s biochemical reactions.',
        },
        bn: {
          q: 'কোষীয় শ্বসনের মাধ্যমে ATP সংশ্লেষ করার জন্য কোন কোষ অঙ্গাণুকে কোষের শক্তিঘর (Powerhouse of the cell) বলা হয়?',
          opts: ['মাইটোকনড্রিয়া', 'রাইবোজোম', 'গলগি বস্তু', 'লাইসোজোম'],
          ans: 0,
          exp: 'মাইটোকনড্রিয়া কোষীয় শ্বসনের মাধ্যমে ATP উৎপন্ন করে বলে একে কোষের শক্তিঘর বলা হয়।',
        },
        hi: {
          q: 'कोशिकीय श्वसन के माध्यम से ATP का संश्लेषण करने के कारण किस कोशिकांग को कोशिका का ऊर्जागृह (Powerhouse) कहा जाता है?',
          opts: ['माइटोकॉन्ड्रिया', 'राइबोसोम', 'गॉल्जीकाय', 'लाइसोसोम'],
          ans: 0,
          exp: 'माइटोकॉन्ड्रिया कोशिकीय श्वसन द्वारा ऊर्जा (ATP) का निर्माण करता है, इसलिए इसे कोशिका का पावरहाउस कहते हैं।',
        },
      },
      {
        key: 'photosynthesis_gas',
        en: {
          q: 'During photosynthesis in green plants, which gas is released into the atmosphere as a by-product of photolysis of water?',
          opts: ['Oxygen (O₂)', 'Carbon dioxide (CO₂)', 'Nitrogen (N₂)', 'Hydrogen (H₂)'],
          ans: 0,
          exp: 'Oxygen is released during the light-dependent reactions of photosynthesis when water molecules are split.',
        },
        bn: {
          q: 'সবুজ উদ্ভিদের সালোকসংশ্লেষ প্রক্রিয়ায় জলের আলোক-বিশ্লেষণের উপজাত পদার্থ হিসেবে কোন গ্যাস পরিবেশে নির্গত হয়?',
          opts: ['অক্সিজেন (O₂)', 'কার্বন ডাইঅক্সাইড (CO₂)', 'নাইট্রোজেন (N₂)', 'হাইড্রোজেন (H₂)'],
          ans: 0,
          exp: 'সালোকসংশ্লেষের আলোক দশায় জলের ফটোলাইসিস ঘটে এবং উপজাত হিসেবে অক্সিজেন গ্যাস নির্গত হয়।',
        },
        hi: {
          q: 'हरे पौधों में प्रकाश संश्लेषण के दौरान जल के प्रकाश-अपघटन के उप-उत्पाद के रूप में कौन सी गैस वायुमंडल में मुक्त होती है?',
          opts: ['ऑक्सीजन (O₂)', 'कार्बन डाइऑक्साइड (CO₂)', 'नाइट्रोजन (N₂)', 'हाइड्रोजन (H₂)'],
          ans: 0,
          exp: 'प्रकाश संश्लेषण की प्रकाशीय अभिक्रिया में जल के अणुओं के टूटने से ऑक्सीजन (O₂) गैस मुक्त होती है।',
        },
      },
      {
        key: 'indian_constitution_enforcement_1950',
        en: {
          q: 'On which exact date did the Constitution of India come into full force, celebrated annually as Republic Day?',
          opts: ['26 January 1950', '15 August 1947', '26 November 1949', '2 October 1950'],
          ans: 0,
          exp: 'The Constitution of India was adopted on 26 November 1949 and came into effect on 26 January 1950.',
        },
        bn: {
          q: 'কোন ঐতিহাসিক তারিখে ভারতের সংবিধান সম্পূর্ণরূপে কার্যকর হয়েছিল, যা প্রতি বছর প্রজাতন্ত্র দিবস হিসেবে পালিত হয়?',
          opts: ['২৬ জানুয়ারি ১৯৫০', '১৫ আগস্ট ১৯৪৭', '২৬ নভেম্বর ১৯৪৯', '২ অক্টোবর ১৯৫০'],
          ans: 0,
          exp: '১৯৪৯ সালের ২৬ নভেম্বর গৃহীত হওয়ার পর ১৯৫০ সালের ২৬ জানুয়ারি ভারতের সংবিধান কার্যকর হয়।',
        },
        hi: {
          q: 'किस ऐतिहासिक तिथि को भारत का संविधान पूर्ण रूप से लागू हुआ, जिसे प्रतिवर्ष गणतंत्र दिवस के रूप में मनाया जाता है?',
          opts: ['26 जनवरी 1950', '15 अगस्त 1947', '26 नवंबर 1949', '2 अक्टूबर 1950'],
          ans: 0,
          exp: 'भारतीय संविधान 26 नवंबर 1949 को अंगीकृत किया गया और 26 जनवरी 1950 को पूर्ण रूप से लागू हुआ।',
        },
      },
      {
        key: 'rabindranath_nobel_1913',
        en: {
          q: 'In which year was Rabindranath Tagore awarded the Nobel Prize in Literature for "Gitanjali"?',
          opts: ['1913', '1905', '1921', '1930'],
          ans: 0,
          exp: 'Rabindranath Tagore became the first non-European Nobel laureate in Literature in 1913 for Song Offerings (Gitanjali).',
        },
        bn: {
          q: 'রবীন্দ্রনাথ ঠাকুর কত খ্রিস্টাব্দে ‘গীতাঞ্জলি’ কাব্যগ্রন্থের জন্য সাহিত্যে নোবেল পুরস্কার লাভ করেন?',
          opts: ['১৯১৩ খ্রিস্টাব্দে', '১৯০৫ খ্রিস্টাব্দে', '১৯২১ খ্রিস্টাব্দে', '১৯৩০ খ্রিস্টাব্দে'],
          ans: 0,
          exp: '১৯১৩ খ্রিস্টাব্দে রবীন্দ্রনাথ ঠাকুর প্রথম এশীয় হিসেবে সাহিত্যে নোবেল পুরস্কার পান।',
        },
        hi: {
          q: 'रबीन्द्रनाथ टैगोर को "गीतांजलि" के लिए किस वर्ष साहित्य का नोबेल पुरस्कार प्रदान किया गया था?',
          opts: ['1913', '1905', '1921', '1930'],
          ans: 0,
          exp: 'रबीन्द्रनाथ टैगोर को वर्ष 1913 में गीतांजलि के लिए साहित्य के नोबेल पुरस्कार से सम्मानित किया गया था।',
        },
      },
      {
        key: 'isro_chandrayaan3_2023',
        en: {
          q: 'On which date in August 2023 did ISRO’s Chandrayaan-3 Vikram lander successfully touch down near the lunar south pole?',
          opts: ['23 August 2023', '14 July 2023', '2 September 2023', '15 August 2023'],
          ans: 0,
          exp: 'Chandrayaan-3 successfully soft-landed on the Moon on 23 August 2023, celebrated in India as National Space Day.',
        },
        bn: {
          q: '২০২৩ সালের আগস্ট মাসের কোন তারিখে ইসরোর (ISRO) চন্দ্রযান-৩ সফলভাবে চাঁদের দক্ষিণ মেরুর কাছে অবতরণ করে?',
          opts: ['২৩ আগস্ট ২০২৩', '১৪ জুলাই ২০২৩', '২ সেপ্টেম্বর ২০২৩', '১৫ আগস্ট ২০২৩'],
          ans: 0,
          exp: '২০২৩ সালের ২৩ আগস্ট চন্দ্রযান-৩ চাঁদের দক্ষিণ মেরুতে সফলভাবে অবতরণ করে, যা জাতীয় মহাকাশ দিবস হিসেবে ঘোষিত হয়েছে।',
        },
        hi: {
          q: 'अगस्त 2023 में किस तिथि को इसरो (ISRO) के चंद्रयान-3 के विक्रम लैंडर ने चंद्रमा के दक्षिणी ध्रुव के पास सफलतापूर्वक लैंडिंग की?',
          opts: ['23 अगस्त 2023', '14 जुलाई 2023', '2 सितंबर 2023', '15 अगस्त 2023'],
          ans: 0,
          exp: '23 अगस्त 2023 को चंद्रयान-3 ने चंद्रमा के दक्षिणी ध्रुव पर सफल सॉफ्ट लैंडिंग की, जिसे राष्ट्रीय अंतरिक्ष दिवस घोषित किया गया।',
        },
      },
      {
        key: 'xylem_water_transport',
        en: {
          q: 'Which vascular tissue in plants is responsible for the upward transport of water and dissolved minerals from roots to leaves?',
          opts: ['Xylem', 'Phloem', 'Cambium', 'Epidermis'],
          ans: 0,
          exp: 'Xylem vessels and tracheids conduct water and minerals unidirectionally from the roots to aerial parts of the plant.',
        },
        bn: {
          q: 'উদ্ভিদদেহে মূলরোম দ্বারা শোষিত জল ও খনিজ লবণ পাতায় পরিবহনের জন্য কোন সংবহন কলা দায়ী?',
          opts: ['জাইলেম (Xylem)', 'ফ্লোয়েম (Phloem)', 'ক্যাম্বিয়াম', 'ত্বক কলা'],
          ans: 0,
          exp: 'জাইলেম কলার মাধ্যমে মূল দ্বারা শোষিত জল ও খনিজ লবণ ঊর্ধ্বমুখী সংবহনের মাধ্যমে পাতায় পৌঁছায়।',
        },
        hi: {
          q: 'पौधों में जड़ों से पत्तियों तक जल और घुलित खनिजों के ऊर्ध्वमुखी परिवहन के लिए कौन सा संवहनी ऊतक उत्तरदायी है?',
          opts: ['जाइलम (Xylem)', 'फ्लोएम (Phloem)', 'कैम्बियम', 'एपिडर्मिस'],
          ans: 0,
          exp: 'जाइलम ऊतक जड़ों द्वारा अवशोषित जल और खनिज लवणों को पौधे के विभिन्न भागों तक पहुंचाता है।',
        },
      },
      {
        key: 'sundarbans_unesco_1987',
        en: {
          q: 'In which year was the Sundarbans National Park in West Bengal inscribed as a UNESCO World Heritage Site?',
          opts: ['1987', '1973', '1999', '1980'],
          ans: 0,
          exp: 'Sundarbans National Park in West Bengal was designated a UNESCO World Heritage Site in 1987.',
        },
        bn: {
          q: 'পশ্চিমবঙ্গের সুন্দরবন জাতীয় উদ্যান কোন সালে ইউনেস্কো (UNESCO) ওয়ার্ল্ড হেরিটেজ সাইটের স্বীকৃতি পায়?',
          opts: ['১৯৮৭ সালে', '১৯৭৩ সালে', '১৯৯৯ সালে', '১৯৮০ সালে'],
          ans: 0,
          exp: '১৯৮৭ সালে সুন্দরবন জাতীয় উদ্যান ইউনেস্কো বিশ্ব ঐতিহ্যবাহী স্থানের (World Heritage Site) মর্যাদা লাভ করে।',
        },
        hi: {
          q: 'पश्चिम बंगाल के सुंदरबन राष्ट्रीय उद्यान को किस वर्ष यूनेस्को (UNESCO) विश्व धरोहर स्थल घोषित किया गया था?',
          opts: ['1987', '1973', '1999', '1980'],
          ans: 0,
          exp: 'पश्चिम बंगाल स्थित सुंदरबन राष्ट्रीय उद्यान को 1987 में यूनेस्को विश्व धरोहर स्थल घोषित किया गया था।',
        },
      },
      {
        key: 'vitamin_c_scurvy',
        en: {
          q: 'Deficiency of which water-soluble vitamin in the human diet causes Scurvy (bleeding gums)?',
          opts: ['Vitamin C (Ascorbic acid)', 'Vitamin A (Retinol)', 'Vitamin D (Calciferol)', 'Vitamin B₁ (Thiamine)'],
          ans: 0,
          exp: 'Scurvy is caused by a prolonged deficiency of Vitamin C (ascorbic acid), which is essential for collagen synthesis.',
        },
        bn: {
          q: 'মানবদেহে জলে দ্রবণীয় কোন ভিটামিনের অভাবে স্কার্ভি (দাঁতের মাড়ি থেকে রক্তপাত) রোগ হয়?',
          opts: ['ভিটামিন C (অ্যাসকরবিক অ্যাসিড)', 'ভিটামিন A (রেটিনল)', 'ভিটামিন D (ক্যালসিফেরল)', 'ভিটামিন B₁ (থায়ামিন)'],
          ans: 0,
          exp: 'ভিটামিন C বা অ্যাসকরবিক অ্যাসিডের অভাবে স্কার্ভি রোগ হয়।',
        },
        hi: {
          q: 'मानव आहार में जल में घुलनशील किस विटामिन की कमी से स्कर्वी (मसूड़ों से खून आना) रोग होता है?',
          opts: ['विटामिन C (एस्कॉर्बिक अम्ल)', 'विटामिन A (रेटिनॉल)', 'विटामिन D (कैल्सिफेरॉल)', 'विटामिन B₁ (थायमिन)'],
          ans: 0,
          exp: 'विटामिन C (एस्कॉर्बिक अम्ल) की कमी से स्कर्वी रोग होता है।',
        },
      },
      {
        key: 'eng_grammar_past_tense',
        en: {
          q: 'In English grammar, choose the correct form of the verb to complete: "Neither the teacher nor the students ___ present yesterday."',
          opts: ['were', 'was', 'is', 'has been'],
          ans: 0,
          exp: 'With "Neither...nor", the verb agrees with the closer subject ("students", plural), and "yesterday" requires the past tense "were".',
        },
        bn: {
          q: 'ইংরেজি ব্যাকরণের নিয়ম অনুযায়ী শূন্যস্থান পূরণ করো: "Neither the teacher nor the students ___ present yesterday."',
          opts: ['were', 'was', 'is', 'has been'],
          ans: 0,
          exp: '"Neither...nor" থাকলে ক্রিয়াপদটি নিকটবর্তী কর্তা ("students", বহুবচন) এবং অতীত কাল ("yesterday") অনুযায়ী "were" হয়।',
        },
        hi: {
          q: 'अंग्रेजी व्याकरण के अनुसार सही क्रिया चुनें: "Neither the teacher nor the students ___ present yesterday."',
          opts: ['were', 'was', 'is', 'has been'],
          ans: 0,
          exp: '"Neither...nor" के साथ क्रिया নিকটतम कर्ता ("students", बहुवचन) और भूतकाल ("yesterday") के अनुसार "were" होगी।',
        },
      },
      {
        key: 'hindi_grammar_sandhi_vidyalaya',
        en: {
          q: 'Which type of Sandhi is formed in the word "Vidyalaya" (Vidya + Alaya)?',
          opts: ['Dirgha Swar Sandhi', 'Guna Swar Sandhi', 'Vyanjan Sandhi', 'Visarga Sandhi'],
          ans: 0,
          exp: 'When two similar vowels (ā + ā = ā) combine to form a long vowel in Vidya + Alaya = Vidyalaya, it is Dirgha Swar Sandhi.',
        },
        bn: {
          q: '‘বিদ্যালয়’ (বিদ্যা + আলয়) শব্দটিতে কোন প্রকার সন্ধি হয়েছে?',
          opts: ['দীর্ঘ স্বরসন্ধি', 'গুণ স্বরসন্ধি', 'ব্যঞ্জনসন্ধি', 'বিসর্গসন্ধি'],
          ans: 0,
          exp: 'আ-কার + আ-কার = আ-কার (বিদ্যা + আলয় = বিদ্যালয়) হওয়ায় এটি স্বরসন্ধির অন্তর্গত দীর্ঘ স্বরসন্ধি।',
        },
        hi: {
          q: '‘विद्यालय’ (विद्या + आलय) शब्द में कौन सी संधि है?',
          opts: ['दीर्घ स्वर संधि', 'गुण स्वर संधि', 'व्यंजन संधि', 'विसर्ग संधि'],
          ans: 0,
          exp: 'समान स्वरों (आ + आ = आ) के मेल से दीर्घ स्वर बनने के कारण "विद्या + आलय = विद्यालय" में दीर्घ स्वर संधि है।',
        },
      },
    ];

    for (let i = 0; i < config.questionCount + 25; i++) {
      const item = bankItems[i % bankItems.length];
      addCandidate({
        conceptKey: `${subj}_c${cls}_${item.key}_${i}`,
        topic: config.topic || `Class ${cls} Core Curriculum`,
        difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
        questionType: 'mcq',
        en: {
          ...item.en,
          q: i >= bankItems.length ? `[Class ${cls} Set #${i + 1}] ${item.en.q}` : item.en.q,
        },
        bn: {
          ...item.bn,
          q: i >= bankItems.length ? `[শ্রেণি ${cls} সেট #${i + 1}] ${item.bn.q}` : item.bn.q,
        },
        hi: {
          ...item.hi,
          q: i >= bankItems.length ? `[कक्षा ${cls} सेट #${i + 1}] ${item.hi.q}` : item.hi.q,
        },
      });
    }
  }

  return results;
}

// Main Universal API Handler for Vercel Serverless Functions and Express
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
        model: ACTIVE_GEMINI_MODEL,
        supportedModels: SUPPORTED_GEMINI_MODELS,
        freeTierEligible: true,
        apiKeyConfigured: hasKey,
      });
      return;
    }

    // 2. Generate Unique Quiz Endpoint
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
      } = body || {};

      const rateKey = `${userId || 'anon'}_quiz`;
      const limitCheck = checkRateLimit(rateKey);
      if (!limitCheck.allowed) {
        sendJson(res, 429, {
          error: `Rate limit reached. Please wait ${limitCheck.retryAfterSeconds} seconds before generating another quiz.`,
        });
        return;
      }

      const validCount = [5, 10, 15, 20, 30].includes(Number(questionCount))
        ? Number(questionCount)
        : 5;
      const validClass = [5, 6, 7, 8, 9, 10].includes(Number(classLevel))
        ? Number(classLevel)
        : 8;
      const validQuizLang: 'en' | 'bn' | 'hi' =
        quizLanguage === 'bn' || quizLanguage === 'hi' ? quizLanguage : 'en';

      const userHist = getUserHistory(String(userId));
      if (Array.isArray(clientExcludedFingerprints)) {
        for (const fp of clientExcludedFingerprints) {
          if (typeof fp === 'string') userHist.fingerprints.add(fp);
        }
      }

      const excludedFingerprintsSnapshot = new Set<string>(userHist.fingerprints);
      const excludedConceptsSnapshot = new Set<string>(userHist.concepts);
      const excludedHistoryCount = excludedFingerprintsSnapshot.size;

      const validatedQuestions: ServerQuestion[] = [];
      let usedGemini = false;
      let resolvedModelName = ACTIVE_GEMINI_MODEL;
      let notice: string | undefined;

      const ai = getAiClient();
      if (ai) {
        try {
          const langName =
            validQuizLang === 'bn'
              ? 'Bengali (বাংলা)'
              : validQuizLang === 'hi'
              ? 'Hindi (हिन्दी)'
              : 'English';

          const recentConcepts = Array.from(excludedConceptsSnapshot).slice(-30).join(', ');

          const systemInstruction = `You are a senior academic curriculum examiner for West Bengal Board (WBBPE/WBBSE) Classes 5 to 10.
CRITICAL RULES:
1. Subject Independence: The academic subject being tested is "${subject}". The presentation language (Quiz Language) is "${langName}".
2. Even if the subject is Bangla, English, or Hindi, you MUST write the question stem, instructions, and explanation in "${langName}" while testing the academic content of "${subject}" for Class ${validClass}.
3. Every question must be 100% factually and mathematically accurate for Class ${validClass}.
4. Do NOT repeat any of these previously tested concept keys: [${recentConcepts || 'none'}].
5. Use different concepts, reasoning approaches, examples, numerical values, and plausible distractors.
6. For General Knowledge (gk), include verifiable dates or authoritative sources in the question or explanation.
7. For questionType "${questionType}": if "mcq", provide exactly 4 distinct options and correctIndex (0-3). If "tf", provide 2 options (True/False in ${langName}) and correctIndex (0 or 1). If "mixed", include both "mcq" and "tf" questions.`;

          const prompt = `Generate exactly ${validCount} unique quiz questions for:
- Class: Class ${validClass}
- Subject: ${subject}
- Topic/Chapter: ${topic}
- Difficulty: ${difficulty}
- Question Type: ${questionType}
- Quiz Presentation Language: ${langName} (code: ${validQuizLang})
- Unique Generation Seed: ${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

          const { response, modelUsed } = await generateContentWithModelFallback(ai, {
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.75,
              responseMimeType: 'application/json',
              responseSchema: {
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
                      description: `Step-by-step explanation of why the correct option is right, in ${langName}`,
                    },
                    hint: {
                      type: Type.STRING,
                      description: `Short helpful hint without giving away the answer, in ${langName}`,
                    },
                    topic: {
                      type: Type.STRING,
                      description: 'Specific chapter or subtopic name',
                    },
                    difficulty: {
                      type: Type.STRING,
                      description: 'easy, medium, or hard',
                    },
                    conceptKey: {
                      type: Type.STRING,
                      description:
                        'Language-agnostic snake_case identifier of the core academic concept tested',
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
              },
            },
          });

          resolvedModelName = modelUsed;
          const parsed = parseGeminiJsonSafe(response?.text);
          const candidateArray = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.questions)
            ? parsed.questions
            : Array.isArray(parsed?.items)
            ? parsed.items
            : [];

          if (candidateArray.length > 0) {
            for (const item of candidateArray) {
              if (validatedQuestions.length >= validCount) break;
              const v = validateAndNormalizeQuestion(
                item,
                {
                  classLevel: validClass,
                  subject: String(subject),
                  quizLanguage: validQuizLang,
                  topic: String(topic),
                  difficulty: String(difficulty),
                },
                validatedQuestions.length
              );
              if (
                v &&
                !excludedFingerprintsSnapshot.has(v.fingerprint) &&
                !excludedConceptsSnapshot.has(v.conceptKey)
              ) {
                excludedFingerprintsSnapshot.add(v.fingerprint);
                excludedConceptsSnapshot.add(v.conceptKey);
                validatedQuestions.push(v);
              }
            }
            if (validatedQuestions.length > 0) {
              usedGemini = true;
            }
          }
        } catch (aiErr: any) {
          logServerError('Gemini quiz generation fallback triggered', aiErr, {
            classLevel: validClass,
            subject,
            quizLanguage: validQuizLang,
          });
          notice =
            'Gemini API quota or timeout reached; supplemented with curriculum-verified questions.';
        }
      } else {
        logServerError(
          'GEMINI_API_KEY not found in environment',
          new Error('Missing GEMINI_API_KEY environment variable')
        );
        notice =
          'Generated using the built-in parameterized WBBSE/WBBPE curriculum engine (configure GEMINI_API_KEY in Vercel Environment Variables for live AI generation).';
      }

      if (validatedQuestions.length < validCount) {
        const needed = validCount - validatedQuestions.length;
        const fallbackItems = generateVerifiedCurriculumQuestions(
          {
            classLevel: validClass,
            subject: String(subject),
            quizLanguage: validQuizLang,
            topic: String(topic),
            difficulty: String(difficulty),
            questionCount: needed,
            questionType: String(questionType),
          },
          excludedFingerprintsSnapshot,
          excludedConceptsSnapshot
        );
        for (const fb of fallbackItems) {
          if (validatedQuestions.length >= validCount) break;
          fb.id = `q_${validClass}_${subject}_${fb.fingerprint}_${validatedQuestions.length}`;
          validatedQuestions.push(fb);
        }
      }

      for (const q of validatedQuestions) {
        userHist.fingerprints.add(q.fingerprint);
        userHist.concepts.add(q.conceptKey);
      }

      const attemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const attempt: ServerQuizAttempt = {
        attemptId,
        userId: String(userId),
        config: {
          classLevel: validClass,
          subject: String(subject),
          quizLanguage: validQuizLang,
          topic: String(topic),
          difficulty: String(difficulty),
          questionCount: validatedQuestions.length,
          questionType: String(questionType),
          durationMinutes: Number(durationMinutes) || 0,
          mode: mode === 'test' ? 'test' : 'practice',
        },
        questions: validatedQuestions,
        lockedAnswers: {},
        markedForReview: [],
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        timeTakenSeconds: 0,
        generationInfo: {
          model: resolvedModelName,
          source: usedGemini ? 'gemini-ai' : 'verified-curriculum-engine',
          excludedHistoryCount,
          uniqueConceptsCount: validatedQuestions.length,
          notice,
        },
      };

      serverAttempts.set(attemptId, attempt);
      console.info(
        `[IQ Quiz Server] Quiz created | attemptId=${attemptId} | model=${resolvedModelName} | source=${attempt.generationInfo.source} | class=${validClass} | subject=${subject} | lang=${validQuizLang}`
      );
      sendJson(res, 200, sanitizeAttemptForClient(attempt));
      return;
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

    // 7. Retake Quiz
    if (method === 'POST' && routePath === '/api/quiz/retake') {
      const body = await readJsonBody(req);
      const {
        originalAttemptId,
        originalConfig,
        originalQuestions,
        serverStateToken,
        quizLanguage,
        userId = 'local_student',
      } = body || {};

      const memOriginal =
        resolveServerAttempt(originalAttemptId, serverStateToken) ||
        serverAttempts.get(originalAttemptId);

      if (!memOriginal && (!originalConfig || !Array.isArray(originalQuestions))) {
        sendJson(res, 404, { error: 'Original attempt not found on server.' });
        return;
      }

      const baseConfig = memOriginal ? memOriginal.config : originalConfig;
      const baseQuestions: ServerQuestion[] = memOriginal
        ? memOriginal.questions
        : originalQuestions;
      const baseAttemptId = memOriginal
        ? memOriginal.attemptId
        : String(originalAttemptId || 'prev');

      const targetLang: 'en' | 'bn' | 'hi' =
        quizLanguage === 'bn' || quizLanguage === 'hi' || quizLanguage === 'en'
          ? quizLanguage
          : baseConfig.quizLanguage;

      let retakeQuestions: ServerQuestion[] = [];
      let resolvedModelName = ACTIVE_GEMINI_MODEL;

      if (targetLang === baseConfig.quizLanguage && memOriginal) {
        retakeQuestions = baseQuestions.map((q) => ({
          ...q,
          options: [...q.options],
        }));
      } else {
        const ai = getAiClient();
        if (ai) {
          try {
            const langName =
              targetLang === 'bn'
                ? 'Bengali (বাংলা)'
                : targetLang === 'hi'
                ? 'Hindi (हिन्दी)'
                : 'English';

            const { response, modelUsed } = await generateContentWithModelFallback(ai, {
              contents: `Translate and adapt the following Class ${baseConfig.classLevel} (${baseConfig.subject}) quiz questions into ${langName} (language code: ${targetLang}). Keep the exact same academic concepts, options order, and correctIndex:\n${JSON.stringify(
                baseQuestions.map((q) => ({
                  questionText: q.questionText,
                  questionType: q.questionType,
                  options: q.options,
                  correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
                  explanation: q.explanation,
                  hint: q.hint,
                  topic: q.topic,
                  difficulty: q.difficulty,
                  conceptKey: q.conceptKey,
                }))
              )}`,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionText: { type: Type.STRING },
                      questionType: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      hint: { type: Type.STRING },
                      topic: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      conceptKey: { type: Type.STRING },
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
                },
              },
            });
            resolvedModelName = modelUsed;
            const parsed = parseGeminiJsonSafe(response?.text);
            const candidateArray = Array.isArray(parsed)
              ? parsed
              : Array.isArray(parsed?.questions)
              ? parsed.questions
              : [];
            for (let i = 0; i < candidateArray.length; i++) {
              const v = validateAndNormalizeQuestion(
                candidateArray[i],
                {
                  classLevel: baseConfig.classLevel,
                  subject: baseConfig.subject,
                  quizLanguage: targetLang,
                  topic: baseConfig.topic,
                  difficulty: baseConfig.difficulty,
                },
                i
              );
              if (v) retakeQuestions.push(v);
            }
          } catch (err) {
            logServerError('Retake language adaptation fallback', err);
          }
        }

        if (retakeQuestions.length < baseQuestions.length) {
          const needed = baseQuestions.length - retakeQuestions.length;
          const fb = generateVerifiedCurriculumQuestions(
            {
              classLevel: baseConfig.classLevel,
              subject: baseConfig.subject,
              quizLanguage: targetLang,
              topic: baseConfig.topic,
              difficulty: baseConfig.difficulty,
              questionCount: needed,
              questionType: baseConfig.questionType,
            },
            new Set(),
            new Set()
          );
          retakeQuestions.push(...fb.slice(0, needed));
        }
      }

      const newAttemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const newAttempt: ServerQuizAttempt = {
        attemptId: newAttemptId,
        parentAttemptId: baseAttemptId,
        userId: String(userId),
        config: {
          ...baseConfig,
          quizLanguage: targetLang,
          questionCount: retakeQuestions.length,
        },
        questions: retakeQuestions,
        lockedAnswers: {},
        markedForReview: [],
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        timeTakenSeconds: 0,
        generationInfo: {
          model: resolvedModelName,
          source: memOriginal?.generationInfo?.source || 'verified-curriculum-engine',
          excludedHistoryCount: memOriginal?.generationInfo?.excludedHistoryCount || 0,
          uniqueConceptsCount: retakeQuestions.length,
          notice: `Retake of Attempt ${baseAttemptId.slice(-6)} in ${targetLang.toUpperCase()} — New independent Attempt ID created.`,
        },
      };

      serverAttempts.set(newAttemptId, newAttempt);
      sendJson(res, 200, sanitizeAttemptForClient(newAttempt));
      return;
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

      const attemptId = `att_notes_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const attempt: ServerQuizAttempt = {
        attemptId,
        userId: String(userId),
        config: {
          classLevel: Number(classLevel) || 8,
          subject: String(subject),
          quizLanguage: validQuizLang,
          topic: String(topic),
          difficulty: 'mixed',
          questionCount: validated.length,
          questionType: 'mcq',
          durationMinutes: 10,
          mode: 'practice',
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
      userFingerprintsHistory.delete(String(userId));
      userConceptHistory.delete(String(userId));
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
        userId = 'local_student',
      } = body || {};

      const rateKey = `${userId || 'anon'}_notes`;
      const limitCheck = checkRateLimit(rateKey);
      if (!limitCheck.allowed) {
        sendJson(res, 429, {
          error: `Rate limit reached. Please wait ${limitCheck.retryAfterSeconds} seconds.`,
        });
        return;
      }

      if ((!sourceText || String(sourceText).trim().length < 10) && !fileData?.base64) {
        sendJson(res, 400, {
          error: 'Please provide study notes text or upload a supported document.',
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

      const ai = getAiClient();
      if (ai) {
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
Regardless of the input note language (${inLangName}), write all output fields (summary, keyConcepts, flashcards, and 5 MCQs) strictly in ${outLangName}.
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
        } catch (aiErr: any) {
          logServerError('Gemini study notes fallback', aiErr);
        }
      }

      const sentences = String(sourceText || title)
        .split(/[.।?!\n]+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 10);

      const fallbackQuestions = generateVerifiedCurriculumQuestions(
        {
          classLevel: Number(classLevel) || 8,
          subject: String(subject),
          quizLanguage: outputLanguage === 'bn' || outputLanguage === 'hi' ? outputLanguage : 'en',
          topic: String(title),
          difficulty: 'mixed',
          questionCount: 5,
          questionType: 'mcq',
        },
        new Set(),
        new Set()
      );

      sendJson(res, 200, {
        title: title || 'Study Revision Note',
        summary:
          sentences.slice(0, 4).join('. ') ||
          'Structured summary prepared from your study notes.',
        keyConcepts: [
          {
            term: title || `Class ${classLevel} Core Concept`,
            explanation:
              sentences[0] ||
              'Fundamental principle highlighted in your uploaded study passage.',
            example:
              sentences[1] || 'Applied in standard WBBSE/WBBPE classroom exercises.',
          },
        ],
        flashcards: fallbackQuestions.slice(0, 4).map((q) => ({
          front: q.questionText,
          back: `${q.options[q.correctIndex]} — ${q.explanation}`,
        })),
        mcqs: fallbackQuestions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: q.difficulty,
        })),
        modelUsed: `${ACTIVE_GEMINI_MODEL} (Structured Local Fallback)`,
        notice:
          'Generated using structured text extraction because Gemini API quota was temporarily unavailable.',
      });
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
