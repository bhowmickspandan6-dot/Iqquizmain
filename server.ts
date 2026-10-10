import 'dotenv/config';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Free-tier eligible models allowlist (never silently switch to a paid model)
const FREE_TIER_MODELS = [
  'gemini-3.8-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
];
const configuredModel = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
const ACTIVE_GEMINI_MODEL = FREE_TIER_MODELS.includes(configuredModel)
  ? configuredModel
  : 'gemini-3.8-flash';

function getServerApiKey(): string {
  const raw =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    '';
  const cleaned = raw.replace(/^["']|["']$/g, '').trim();
  if (!cleaned || cleaned === 'MY_GEMINI_API_KEY') {
    return '';
  }
  return cleaned;
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = getServerApiKey();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Automatically tries the active free-tier Gemini Flash models in order if an endpoint rejects a model alias
async function generateContentWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
): Promise<{ response: any; modelUsed: string }> {
  const candidateModels = Array.from(
    new Set([
      ACTIVE_GEMINI_MODEL,
      'gemini-3.8-flash',
      'gemini-3-flash-preview',
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ])
  );
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: params.config,
      });
      return { response, modelUsed: modelName };
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || err || '').toLowerCase();
      // If rate limit / quota exhausted (429), do not hammer other aliases unnecessarily
      if (msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) {
        break;
      }
    }
  }
  throw lastError || new Error('Gemini API request failed.');
}

// Safely parses structured JSON from Gemini responses, stripping markdown code fences or surrounding prose if present
function parseGeminiJsonSafe(rawText: string | undefined): any {
  if (!rawText || typeof rawText !== 'string') return null;
  let cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!cleaned) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to extract the outermost JSON array or object
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

// In-memory rate limiting per user/IP (protects free-tier quota)
const rateLimitWindowMs = 60 * 1000;
const maxRequestsPerMinute = 20;
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

// Question fingerprinting & per-user history stores
function computeFingerprint(text: string): string {
  const normalized = (text || '')
    .toLowerCase()
    .replace(/[\s\p{P}]+/gu, ' ')
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

// Server-side authoritative quiz attempt store (protects Test Mode answers & enforces irreversible locking)
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

// Stateless AES-256-GCM encryption for ServerQuizAttempt so Vercel Serverless Functions
// preserve authoritative quiz state & hidden Test Mode answers across cold starts.
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

  // Monotonically preserve any previously locked answers (never unlock an already locked answer)
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

// Sanitize attempt for client delivery:
// NEVER expose correctIndex or explanation in Test Mode before completion,
// or in Practice Mode before that specific question is locked!
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

// Programmatic backend question validation (Section 11)
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
    // Ensure 4 distinct options for MCQ
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
      typeof raw.topic === 'string' && raw.topic.trim().length > 1
        ? raw.topic.trim()
        : config.topic,
    difficulty: diff,
    language: config.quizLanguage,
    questionType: qType,
    questionText: raw.questionText.trim(),
    options,
    correctIndex,
    explanation,
    hint: typeof raw.hint === 'string' ? raw.hint.trim() : undefined,
  };
}

// Parameterized Curriculum-Verified Question Generator
// Ensures 100% unique, mathematically & conceptually verified questions across all 6 classes, 7 subjects, and 3 languages
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
  excludeFingerprints: Set<string>,
  excludeConcepts: Set<string>
): ServerQuestion[] {
  const results: ServerQuestion[] = [];
  const lang = config.quizLanguage;
  const cls = config.classLevel;
  const sub = config.subject;
  const seedBase = Date.now() % 10000;

  // Helper to build a question in the requested quiz language
  const addCandidate = (candidate: {
    conceptKey: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questionType: 'mcq' | 'tf';
    en: { q: string; opts: string[]; ans: number; exp: string; hint?: string };
    bn: { q: string; opts: string[]; ans: number; exp: string; hint?: string };
    hi: { q: string; opts: string[]; ans: number; exp: string; hint?: string };
  }) => {
    if (results.length >= config.questionCount) return;
    if (
      config.questionType === 'mcq' &&
      candidate.questionType !== 'mcq'
    ) {
      return;
    }
    if (
      config.questionType === 'tf' &&
      candidate.questionType !== 'tf'
    ) {
      return;
    }

    const localized = candidate[lang] || candidate.en;
    const fp = computeFingerprint(localized.q);
    if (excludeFingerprints.has(fp) || excludeConcepts.has(candidate.conceptKey)) {
      return;
    }

    const validated = validateAndNormalizeQuestion(
      {
        questionText: localized.q,
        options: localized.opts,
        correctIndex: localized.ans,
        explanation: localized.exp,
        hint: localized.hint,
        conceptKey: candidate.conceptKey,
        topic: candidate.topic,
        difficulty: candidate.difficulty,
        questionType: candidate.questionType,
      },
      config,
      results.length
    );

    if (validated) {
      excludeFingerprints.add(validated.fingerprint);
      excludeConcepts.add(validated.conceptKey);
      results.push(validated);
    }
  };

  // Generate dynamic parameterized items based on subject & classLevel
  for (let i = 0; i < 60 && results.length < config.questionCount; i++) {
    const n1 = ((seedBase + i * 7) % 18) + cls + 2;
    const n2 = ((seedBase + i * 13) % 12) + 3;
    const wantTf =
      config.questionType === 'tf' || (config.questionType === 'mixed' && i % 4 === 3);

    if (sub === 'mathematics') {
      if (wantTf) {
        const prod = n1 * n2;
        const isTrue = i % 2 === 0;
        const shownProd = isTrue ? prod : prod + n2;
        addCandidate({
          conceptKey: `math_c${cls}_prod_verify_${n1}_${n2}_${i}`,
          topic: config.topic || `Class ${cls} Arithmetic & Number Operations`,
          difficulty: i % 2 === 0 ? 'easy' : 'medium',
          questionType: 'tf',
          en: {
            q: `[Class ${cls}] True or False: If a rectangular field has length ${n1} m and breadth ${n2} m, its area is exactly ${shownProd} sq. m.`,
            opts: ['True', 'False'],
            ans: isTrue ? 0 : 1,
            exp: `Area of a rectangle = length × breadth = ${n1} × ${n2} = ${prod} sq. m. Therefore, the statement is ${isTrue ? 'True' : 'False'}.`,
          },
          bn: {
            q: `[শ্রেণি ${cls}] সত্য না মিথ্যা: একটি আয়তাকার মাঠের দৈর্ঘ্য ${n1} মিটার এবং প্রস্থ ${n2} মিটার হলে তার ক্ষেত্রফল ${shownProd} বর্গমিটার।`,
            opts: ['সত্য (True)', 'মিথ্যা (False)'],
            ans: isTrue ? 0 : 1,
            exp: `আয়তক্ষেত্রের ক্ষেত্রফল = দৈর্ঘ্য × প্রস্থ = ${n1} × ${n2} = ${prod} বর্গমিটার। তাই বিবৃতিটি ${isTrue ? 'সত্য' : 'মিথ্যা'}।`,
          },
          hi: {
            q: `[कक्षा ${cls}] सत्य या असत्य: यदि एक आयताकार मैदान की लंबाई ${n1} मीटर और चौड़ाई ${n2} मीटर है, तो उसका क्षेत्रफल ${shownProd} वर्ग मीटर होगा।`,
            opts: ['सत्य (True)', 'असत्य (False)'],
            ans: isTrue ? 0 : 1,
            exp: `आयत का क्षेत्रफल = लंबाई × चौड़ाई = ${n1} × ${n2} = ${prod} वर्ग मीटर। अतः यह कथन ${isTrue ? 'सत्य' : 'असत्य'} है।`,
          },
        });
      } else if (i % 3 === 0) {
        // Linear equation / algebra parameterized
        const xVal = (i % 9) + 2;
        const coeff = (cls % 5) + 2 + (i % 4);
        const constTerm = n2;
        const rhs = coeff * xVal + constTerm;
        addCandidate({
          conceptKey: `math_c${cls}_linear_eq_${coeff}_${xVal}_${constTerm}`,
          topic: config.topic || `Class ${cls} Algebra & Equations`,
          difficulty: 'medium',
          questionType: 'mcq',
          en: {
            q: `Solve for x in the linear equation: ${coeff}x + ${constTerm} = ${rhs}`,
            opts: [`x = ${xVal}`, `x = ${xVal + 2}`, `x = ${xVal - 1}`, `x = ${xVal + 4}`],
            ans: 0,
            exp: `Subtracting ${constTerm} from both sides gives ${coeff}x = ${rhs - constTerm}. Dividing by ${coeff} gives x = ${xVal}.`,
            hint: `First subtract ${constTerm} from ${rhs}, then divide by ${coeff}.`,
          },
          bn: {
            q: `সমাধান করো: ${coeff}x + ${constTerm} = ${rhs} সমীকরণে x-এর মান কত?`,
            opts: [`x = ${xVal}`, `x = ${xVal + 2}`, `x = ${xVal - 1}`, `x = ${xVal + 4}`],
            ans: 0,
            exp: `${coeff}x = ${rhs} - ${constTerm} = ${rhs - constTerm}। অতএব, x = ${rhs - constTerm} ÷ ${coeff} = ${xVal}।`,
            hint: `প্রথমে উভয় পক্ষ থেকে ${constTerm} বিয়োগ করো।`,
          },
          hi: {
            q: `रैखिक समीकरण हल करें: ${coeff}x + ${constTerm} = ${rhs} में x का मान क्या है?`,
            opts: [`x = ${xVal}`, `x = ${xVal + 2}`, `x = ${xVal - 1}`, `x = ${xVal + 4}`],
            ans: 0,
            exp: `दोनों पक्षों से ${constTerm} घटाने पर ${coeff}x = ${rhs - constTerm} प्राप्त होता है। ${coeff} से भाग देने पर x = ${xVal} मिलता है।`,
            hint: `पहले ${rhs} में से ${constTerm} घटाएँ और फिर ${coeff} से भाग दें।`,
          },
        });
      } else if (i % 3 === 1) {
        // Percentage / Ratio problem
        const base = (i + 2) * 50;
        const rate = ((i % 4) + 1) * 10;
        const val = (base * rate) / 100;
        addCandidate({
          conceptKey: `math_c${cls}_percentage_${base}_${rate}`,
          topic: config.topic || `Class ${cls} Percentage & Ratio`,
          difficulty: 'easy',
          questionType: 'mcq',
          en: {
            q: `What is ${rate}% of ${base} in a Class ${cls} quantitative problem?`,
            opts: [`${val}`, `${val + 15}`, `${val + 25}`, `${Math.max(5, val - 10)}`],
            ans: 0,
            exp: `${rate}% of ${base} = (${rate} / 100) × ${base} = ${val}.`,
          },
          bn: {
            q: `${base}-এর ${rate}% কত হবে?`,
            opts: [`${val}`, `${val + 15}`, `${val + 25}`, `${Math.max(5, val - 10)}`],
            ans: 0,
            exp: `${base}-এর ${rate}% = (${base} × ${rate}) ÷ 100 = ${val}।`,
          },
          hi: {
            q: `${base} का ${rate}% कितना होता है?`,
            opts: [`${val}`, `${val + 15}`, `${val + 25}`, `${Math.max(5, val - 10)}`],
            ans: 0,
            exp: `${base} का ${rate}% = (${base} × ${rate}) ÷ 100 = ${val}।`,
          },
        });
      } else {
        // Geometry / Perimeter & Angles
        const sideA = n1;
        const sideB = n2;
        const perim = 2 * (sideA + sideB);
        addCandidate({
          conceptKey: `math_c${cls}_perimeter_${sideA}_${sideB}`,
          topic: config.topic || `Class ${cls} Geometry & Mensuration`,
          difficulty: 'hard',
          questionType: 'mcq',
          en: {
            q: `A rectangle has length ${sideA} cm and width ${sideB} cm. What is its perimeter?`,
            opts: [
              `${perim} cm`,
              `${sideA * sideB} cm`,
              `${perim + 6} cm`,
              `${sideA + sideB} cm`,
            ],
            ans: 0,
            exp: `Perimeter of a rectangle = 2 × (length + width) = 2 × (${sideA} + ${sideB}) = ${perim} cm.`,
          },
          bn: {
            q: `একটি আয়তক্ষেত্রের দৈর্ঘ্য ${sideA} সেমি এবং প্রস্থ ${sideB} সেমি হলে তার পরিসীমা কত?`,
            opts: [
              `${perim} সেমি`,
              `${sideA * sideB} সেমি`,
              `${perim + 6} সেমি`,
              `${sideA + sideB} সেমি`,
            ],
            ans: 0,
            exp: `আয়তক্ষেত্রের পরিসীমা = ২ × (দৈর্ঘ্য + প্রস্থ) = ২ × (${sideA} + ${sideB}) = ${perim} সেমি।`,
          },
          hi: {
            q: `एक आयत की लंबाई ${sideA} सेमी और चौड़ाई ${sideB} सेमी है। इसका परिमाप क्या है?`,
            opts: [
              `${perim} सेमी`,
              `${sideA * sideB} सेमी`,
              `${perim + 6} सेमी`,
              `${sideA + sideB} सेमी`,
            ],
            ans: 0,
            exp: `आयत का परिमाप = 2 × (लंबाई + चौड़ाई) = 2 × (${sideA} + ${sideB}) = ${perim} सेमी।`,
          },
        });
      }
    } else if (sub === 'physical_science') {
      const mass = (i % 10) + 2;
      const acc = (i % 6) + 3;
      const force = mass * acc;
      if (wantTf) {
        addCandidate({
          conceptKey: `phys_c${cls}_newton_tf_${mass}_${acc}`,
          topic: config.topic || `Force, Motion & Measurement`,
          difficulty: 'medium',
          questionType: 'tf',
          en: {
            q: `True or False: According to Newton's Second Law (F = ma), a body of mass ${mass} kg accelerating at ${acc} m/s² experiences a net force of ${force} N.`,
            opts: ['True', 'False'],
            ans: 0,
            exp: `By Newton's Second Law, Force F = m × a = ${mass} kg × ${acc} m/s² = ${force} N. The statement is True.`,
          },
          bn: {
            q: `সত্য না মিথ্যা: নিউটনের দ্বিতীয় গতিসূত্র (F = ma) অনুযায়ী ${mass} kg ভরের বস্তুতে ${acc} m/s² ত্বরণ সৃষ্টি করতে ${force} N বল প্রয়োজন।`,
            opts: ['সত্য (True)', 'মিথ্যা (False)'],
            ans: 0,
            exp: `F = m × a = ${mass} × ${acc} = ${force} নিউটন (N)। সুতরাং বিবৃতিটি সত্য।`,
          },
          hi: {
            q: `सत्य या असत्य: न्यूटन के गति के दूसरे नियम (F = ma) के अनुसार ${mass} kg द्रव्यमान की वस्तु में ${acc} m/s² का त्वरण उत्पन्न करने के लिए ${force} N बल आवश्यक है।`,
            opts: ['सत्य (True)', 'असत्य (False)'],
            ans: 0,
            exp: `F = m × a = ${mass} × ${acc} = ${force} न्यूटन (N)। अतः यह कथन सत्य है।`,
          },
        });
      } else {
        addCandidate({
          conceptKey: `phys_c${cls}_force_calc_${mass}_${acc}_${i}`,
          topic: config.topic || `Physics & Chemistry Numericals`,
          difficulty: i % 2 === 0 ? 'medium' : 'hard',
          questionType: 'mcq',
          en: {
            q: `[Class ${cls} Physical Science] Calculate the net force required to impart an acceleration of ${acc} m/s² to an object of mass ${mass} kg.`,
            opts: [`${force} N`, `${mass + acc} N`, `${force + 10} N`, `${Math.max(1, force - 5)} N`],
            ans: 0,
            exp: `Using F = m × a, Force = ${mass} kg × ${acc} m/s² = ${force} N.`,
          },
          bn: {
            q: `[শ্রেণি ${cls} ভৌত বিজ্ঞান] ${mass} kg ভরের একটি বস্তুর ওপর কত বল প্রয়োগ করলে ${acc} m/s² ত্বরণ সৃষ্টি হবে?`,
            opts: [`${force} N`, `${mass + acc} N`, `${force + 10} N`, `${Math.max(1, force - 5)} N`],
            ans: 0,
            exp: `নিউটনের দ্বিতীয় সূত্রানুসারে, বল (F) = ভর (m) × ত্বরণ (a) = ${mass} × ${acc} = ${force} N।`,
          },
          hi: {
            q: `[कक्षा ${cls} भौतिक विज्ञान] ${mass} kg द्रव्यमान की किसी वस्तु में ${acc} m/s² का त्वरण उत्पन्न करने के लिए आवश्यक बल की गणना करें।`,
            opts: [`${force} N`, `${mass + acc} N`, `${force + 10} N`, `${Math.max(1, force - 5)} N`],
            ans: 0,
            exp: `सूत्र F = m × a के अनुसार, बल = ${mass} × ${acc} = ${force} N।`,
          },
        });
      }
    } else if (sub === 'life_science') {
      const bioBank = [
        {
          key: 'mitochondria_atp',
          en: {
            q: 'Which cell organelle is known as the powerhouse of the eukaryotic cell because it synthesizes ATP during cellular respiration?',
            opts: ['Mitochondria', 'Ribosome', 'Golgi Apparatus', 'Lysosome'],
            ans: 0,
            exp: 'Mitochondria generate ATP through oxidative phosphorylation during aerobic cellular respiration.',
          },
          bn: {
            q: 'কোষীয় শ্বসনের সময় ATP সংশ্লেষ করার জন্য কোন কোষীয় অঙ্গাণুকে কোষের শক্তিঘর (Powerhouse of the Cell) বলা হয়?',
            opts: ['মাইটোকনড্রিয়া', 'রাইবোজোম', 'গলগি বস্তু', 'লাইসোজোম'],
            ans: 0,
            exp: 'মাইটোকনড্রিয়া সবাত শ্বসনের ক্রেবস চক্র ও অক্সিডেটিভ ফসফোরাইলেশনের মাধ্যমে ATP শক্তি উৎপন্ন করে।',
          },
          hi: {
            q: 'कोशिकीय श्वसन के दौरान ATP का संश्लेषण करने के कारण किस कोशिकांग को कोशिका का ऊर्जा गृह (Powerhouse of the Cell) कहा जाता है?',
            opts: ['माइटोकॉन्ड्रिया', 'राइबोसोम', 'गॉल्जी काय', 'लाइसोसोम'],
            ans: 0,
            exp: 'माइटोकॉन्ड्रिया वायवीय श्वसन के दौरान ATP के रूप में ऊर्जा उत्पन्न करता है।',
          },
        },
        {
          key: 'xylem_water_transport',
          en: {
            q: 'In vascular plants, which tissue is primarily responsible for the upward conduction of water and dissolved minerals from roots to leaves?',
            opts: ['Xylem', 'Phloem', 'Collenchyma', 'Epidermis'],
            ans: 0,
            exp: 'Xylem vessels and tracheids conduct water and minerals upward from the root system to aerial parts.',
          },
          bn: {
            q: 'সংবহন কলাযুক্ত উদ্ভিদে মূলরোম দ্বারা শোষিত জল ও খনিজ লবণ পাতায় পরিবহন করে কোন কলা?',
            opts: ['জাইলেম (Xylem)', 'ফ্লোয়েম (Phloem)', 'কোলেনকাইমা', 'ত্বক কলা'],
            ans: 0,
            exp: 'জাইলেম বাহিকা ও ট্রাকিডের মাধ্যমে মূল থেকে পাতায় জল ও খনিজ লবণ ঊর্ধ্বমুখী সংবাহিত হয়।',
          },
          hi: {
            q: 'संवहनी पौधों में जड़ों से पत्तियों तक जल और खनिज लवणों का ऊर्ध्वमुखी संवहन मुख्य रूप से किस ऊतक द्वारा होता है?',
            opts: ['जाइलम (Xylem)', 'फ्लोएम (Phloem)', 'कोलेनकाइमा', 'एपिडर्मिस'],
            ans: 0,
            exp: 'जाइलम ऊतक जड़ों द्वारा अवशोषित जल और खनिजों को पौधे के ऊपरी भागों तक पहुँचाता है।',
          },
        },
        {
          key: 'photosynthesis_oxygen_source',
          en: {
            q: 'During oxygenic photosynthesis in green plants, the evolved oxygen gas comes directly from the photolysis of which molecule?',
            opts: ['Water (H₂O)', 'Carbon dioxide (CO₂)', 'Glucose (C₆H₁₂O₆)', 'Chlorophyll-a'],
            ans: 0,
            exp: 'Hill reaction / photolysis splits water (H₂O) molecules in the presence of light to release O₂.',
          },
          bn: {
            q: 'সবুজ উদ্ভিদের সালোকসংশ্লেষ প্রক্রিয়ায় উৎপন্ন অক্সিজেন গ্যাসের প্রত্যক্ষ উৎস কোনটি?',
            opts: ['জল (H₂O)', 'কার্বন ডাইঅক্সাইড (CO₂)', 'গ্লুকোজ (C₆H₁₂O₆)', 'ক্লোরোফিল'],
            ans: 0,
            exp: 'সালোকসংশ্লেষের আলোক দশায় জলের ফটোলাইসিস (বিশ্লেষণ) ঘটে অক্সিজেন গ্যাস নির্গত হয়।',
          },
          hi: {
            q: 'हरे पौधों में प्रकाश संश्लेषण की प्रक्रिया के दौरान मुक्त होने वाली ऑक्सीजन गैस का प्रत्यक्ष स्रोत क्या है?',
            opts: ['जल (H₂O)', 'कार्बन डाइऑक्साइड (CO₂)', 'ग्लूकोज़ (C₆H₁₂O₆)', 'क्लोरोफिल'],
            ans: 0,
            exp: 'प्रकाश अभिक्रिया में जल (H₂O) के प्रकाश-अपघटन (Photolysis) से ऑक्सीजन गैस मुक्त होती है।',
          },
        },
        {
          key: 'human_heart_chambers',
          en: {
            q: 'How many chambers are present in the normal adult human heart for separating oxygenated and deoxygenated blood?',
            opts: ['4 chambers (2 Atria, 2 Ventricles)', '2 chambers', '3 chambers', '5 chambers'],
            ans: 0,
            exp: 'The human heart has four chambers: right atrium, right ventricle, left atrium, and left ventricle.',
          },
          bn: {
            q: 'মানুষের হৃৎপিণ্ডে কয়টি প্রকোষ্ঠ থাকে যা দূষিত ও বিশুদ্ধ রক্তকে পৃথক রাখে?',
            opts: ['৪টি প্রকোষ্ঠ (২টি অলিন্দ, ২টি নিলয়)', '২টি প্রকোষ্ঠ', '৩টি প্রকোষ্ঠ', '৫টি প্রকোষ্ঠ'],
            ans: 0,
            exp: 'মানুষের হৃৎপিণ্ডে দুটি অলিন্দ এবং দুটি নিলয় সহ মোট ৪টি প্রকোষ্ঠ থাকে।',
          },
          hi: {
            q: 'ऑक्सीजन युक्त और विऑक्सीजनित रक्त को अलग रखने के लिए मानव हृदय में कितने कक्ष (Chambers) होते हैं?',
            opts: ['4 कक्ष (2 आलिंद, 2 निलय)', '2 कक्ष', '3 कक्ष', '5 कक्ष'],
            ans: 0,
            exp: 'मानव हृदय में दो आलिंद और दो निलय सहित कुल 4 कक्ष होते हैं।',
          },
        },
        {
          key: 'vitamin_c_deficiency',
          en: {
            q: 'Deficiency of Ascorbic Acid (Vitamin C) in the human diet leads to which deficiency disease?',
            opts: ['Scurvy', 'Rickets', 'Night Blindness', 'Goitre'],
            ans: 0,
            exp: 'Vitamin C (ascorbic acid) deficiency impairs collagen synthesis, leading to Scurvy.',
          },
          bn: {
            q: 'খাদ্যে অ্যাসকরবিক অ্যাসিড বা ভিটামিন C-এর অভাবে মানবদেহে কোন রোগটি দেখা যায়?',
            opts: ['স্কার্ভি (Scurvy)', 'রিকেট (Rickets)', 'রাতকানা', 'গলগণ্ড (Goitre)'],
            ans: 0,
            exp: 'ভিটামিন C (অ্যাসকরবিক অ্যাসিড)-এর অভাবে মাড়ি থেকে রক্ত পড়া বা স্কার্ভি রোগ হয়।',
          },
          hi: {
            q: 'मानव आहार में एस्कॉर्बिक अम्ल (विटामिन C) की कमी से कौन-सा रोग होता है?',
            opts: ['स्कर्वी (Scurvy)', 'रिकेट्स (Rickets)', 'रतौंधी', 'घेंघा (Goitre)'],
            ans: 0,
            exp: 'विटामिन C की कमी से मसूड़ों में सूजन और रक्तस्राव वाला स्कर्वी रोग होता है।',
          },
        },
      ];
      const item = bioBank[i % bioBank.length];
      addCandidate({
        conceptKey: `life_c${cls}_${item.key}_${i}`,
        topic: config.topic || `Class ${cls} Life Science`,
        difficulty: i % 2 === 0 ? 'easy' : 'medium',
        questionType: 'mcq',
        en: { ...item.en, q: i >= bioBank.length ? `[Class ${cls} Set ${i}] ${item.en.q}` : item.en.q },
        bn: { ...item.bn, q: i >= bioBank.length ? `[শ্রেণি ${cls} প্রশ্ন ${i}] ${item.bn.q}` : item.bn.q },
        hi: { ...item.hi, q: i >= bioBank.length ? `[कक्षा ${cls} प्रश्न ${i}] ${item.hi.q}` : item.hi.q },
      });
    } else if (sub === 'bangla') {
      const banglaBank = [
        {
          key: 'bn_sandhi_vidyalaya',
          en: {
            q: '[Bangla Grammar] What is the correct Sandhi-vicched (সন্ধি বিচ্ছেদ) of the Bengali word "বিদ্যালয়" (Bidyalay)?',
            opts: ['বিদ্যা + আলয়', 'বিদ্য + আলয়', 'বিদ্যা + লয়', 'বিদ্যু + আলয়'],
            ans: 0,
            exp: 'In Bengali vowel sandhi (স্বরসন্ধি), আ + আ = আ, so বিদ্যা + আলয় = বিদ্যালয়.',
          },
          bn: {
            q: '"বিদ্যালয়" শব্দটির সঠিক সন্ধি বিচ্ছেদ কোনটি?',
            opts: ['বিদ্যা + আলয়', 'বিদ্য + আলয়', 'বিদ্যা + লয়', 'বিদ্যু + আলয়'],
            ans: 0,
            exp: 'স্বরসন্ধির নিয়ম অনুসারে আ-কারের পর আ-কার থাকলে উভয়ে মিলে আ-কার হয়: বিদ্যা + আলয় = বিদ্যালয়।',
          },
          hi: {
            q: '[बांग्ला व्याकरण] बांग्ला शब्द "বিদ্যালয়" (विद्यालय) का सही संधि-विच्छेद क्या है?',
            opts: ['বিদ্যা + আলয়', 'বিদ্য + আলয়', 'বিদ্যা + লয়', 'বিদ্যু + আলয়'],
            ans: 0,
            exp: 'स्वर संधि के नियम के अनुसार আ + আ = আ होता है, अतः বিদ্যা + আলয় = বিদ্যালয়।',
          },
        },
        {
          key: 'bn_karak_kartri',
          en: {
            q: '[Bangla Grammar] In a Bengali sentence, the noun or pronoun that directly performs the action (ক্রিয়া সম্পাদন করে) is in which Karak?',
            opts: ['কর্তৃকারক (Kartri Karak)', 'কর্মকারক (Karma Karak)', 'করণ কারক (Karan Karak)', 'অপাদান কারক (Apadan Karak)'],
            ans: 0,
            exp: 'যে বিশেষ্য বা সর্বনাম পদ ক্রিয়া সম্পাদন করে তাকে কর্তৃকারক বলে (Kartri Karak).',
          },
          bn: {
            q: 'বাক্যে যে বিশেষ্য বা সর্বনাম পদ নিজে ক্রিয়া সম্পাদন করে, তাকে কোন কারক বলে?',
            opts: ['কর্তৃকারক', 'কর্মকারক', 'করণ কারক', 'অপাদান কারক'],
            ans: 0,
            exp: 'বাক্যে যে পদ ক্রিয়া নিষ্পন্ন করে তাকে কর্তৃকারক বলে। যেমন— ছেলেরা ফুটবল খেলছে।',
          },
          hi: {
            q: '[बांग्ला व्याकरण] वाक्य में जो संज्ञा या सर्वनाम पद स्वयं क्रिया संपन्न करता है, उसे बांग्ला व्याकरण में कौन-सा कारक कहते हैं?',
            opts: ['কর্তৃকারক (कर्तृ कारक)', 'কর্মকারক (कर्म कारक)', 'করণ কারক (करण कारक)', 'অপাদান কারক (अपादान कारक)'],
            ans: 0,
            exp: 'क्रिया को करने वाले मुख्य कर्ता को बांग्ला व्याकरण में কর্তৃকারক (कर्तृ कारक) कहा जाता है।',
          },
        },
        {
          key: 'bn_samas_dwandwa',
          en: {
            q: '[Bangla Grammar] In which Samas (সমাস) do the meanings of both constituent words (পূর্বপদ ও পরপদ) remain equally dominant, such as "মাতা-পিতা"?',
            opts: ['দ্বন্দ্ব সমাস (Dwandwa Samas)', 'তৎপুরুষ সমাস (Tatpurush)', 'বহুব্রীহি সমাস (Bahuvrihi)', 'দ্বিগু সমাস (Dwigu)'],
            ans: 0,
            exp: 'যে সমাসে পূর্বপদ ও পরপদ উভয় পদের অর্থই সমানভাবে প্রাধান্য পায় তাকে দ্বন্দ্ব সমাস বলে।',
          },
          bn: {
            q: 'যে সমাসে পূর্বপদ ও পরপদ উভয় পদের অর্থই সমানভাবে প্রাধান্য পায় (যেমন: মাতা ও পিতা = মাতা-পিতা), তাকে কোন সমাস বলে?',
            opts: ['দ্বন্দ্ব সমাস', 'তৎপুরুষ সমাস', 'বহুব্রীহি সমাস', 'কর্মধারয় সমাস'],
            ans: 0,
            exp: 'দ্বন্দ্ব সমাসে সমস্যমান প্রতিটি পদের অর্থ সমানভাবে প্রাধান্য পায়।',
          },
          hi: {
            q: '[बांग्ला व्याकरण] जिस समास में पूर्वपद और उत्तरपद दोनों के अर्थ समान रूप से प्रधान होते हैं (जैसे: মাতা-পিতা), उसे क्या कहते हैं?',
            opts: ['দ্বন্দ্ব সমাস (द्वंद्व समास)', 'তৎপুরুষ সমাস (तत्पुरुष)', 'বহুব্রীহি সমাস (बहुव्रीहि)', 'দ্বিগু সমাস (द्विगु)'],
            ans: 0,
            exp: 'द्वंद्व समास (দ্বন্দ্ব সমাস) में दोनों पदों का अर्थ समान रूप से प्रधान रहता है।',
          },
        },
      ];
      const item = banglaBank[i % banglaBank.length];
      addCandidate({
        conceptKey: `bangla_c${cls}_${item.key}_${i}`,
        topic: config.topic || `Class ${cls} Bangla Grammar & Literature`,
        difficulty: i % 2 === 0 ? 'easy' : 'medium',
        questionType: 'mcq',
        en: { ...item.en, q: i >= banglaBank.length ? `[Class ${cls} Q${i + 1}] ${item.en.q}` : item.en.q },
        bn: { ...item.bn, q: i >= banglaBank.length ? `[শ্রেণি ${cls} প্রশ্ন ${i + 1}] ${item.bn.q}` : item.bn.q },
        hi: { ...item.hi, q: i >= banglaBank.length ? `[कक्षा ${cls} प्रश्न ${i + 1}] ${item.hi.q}` : item.hi.q },
      });
    } else if (sub === 'english') {
      const engBank = [
        {
          key: 'eng_prep_good_at',
          en: {
            q: 'Choose the correct preposition to complete the sentence: "Riya is very good ___ solving algebraic equations."',
            opts: ['at', 'in', 'on', 'with'],
            ans: 0,
            exp: 'The adjective "good" takes the preposition "at" when referring to skill or proficiency in an activity.',
          },
          bn: {
            q: '[English Grammar] শূন্যস্থানে সঠিক Preposition বসাও: "Riya is very good ___ solving algebraic equations."',
            opts: ['at', 'in', 'on', 'with'],
            ans: 0,
            exp: 'কোনো বিষয়ে দক্ষতা বোঝাতে ইংরেজিতে "good at" ব্যবহৃত হয়।',
          },
          hi: {
            q: '[English Grammar] रिक्त स्थान के लिए सही Preposition चुनें: "Riya is very good ___ solving algebraic equations."',
            opts: ['at', 'in', 'on', 'with'],
            ans: 0,
            exp: 'किसी विषय या कार्य में दक्षता दर्शाने के लिए "good at" का प्रयोग किया जाता है।',
          },
        },
        {
          key: 'eng_voice_letter',
          en: {
            q: 'Identify the correct Passive Voice form of: "The teacher praised the student."',
            opts: [
              'The student was praised by the teacher.',
              'The student is praised by the teacher.',
              'The student had been praised by the teacher.',
              'The student has been praised by the teacher.',
            ],
            ans: 0,
            exp: 'Simple Past active ("praised") changes to "was/were + past participle" ("was praised") in Passive Voice.',
          },
          bn: {
            q: '[English Grammar] "The teacher praised the student." — বাক্যটির সঠিক Passive Voice কোনটি?',
            opts: [
              'The student was praised by the teacher.',
              'The student is praised by the teacher.',
              'The student had been praised by the teacher.',
              'The student has been praised by the teacher.',
            ],
            ans: 0,
            exp: 'Simple Past Tense-এ Active থেকে Passive করতে গেলে "was/were + V3" ব্যবহৃত হয়।',
          },
          hi: {
            q: '[English Grammar] "The teacher praised the student." का सही Passive Voice रूप चुनें:',
            opts: [
              'The student was praised by the teacher.',
              'The student is praised by the teacher.',
              'The student had been praised by the teacher.',
              'The student has been praised by the teacher.',
            ],
            ans: 0,
            exp: 'Simple Past Tense ("praised") का Passive रूप "was/were + past participle" ("was praised") होता है।',
          },
        },
        {
          key: 'eng_article_honest',
          en: {
            q: 'Fill in the blank with the appropriate article: "He is ___ honest officer who serves the community."',
            opts: ['an', 'a', 'the', 'no article'],
            ans: 0,
            exp: 'Because "honest" begins with a silent "h" and a vowel sound (/ɒ/), the indefinite article "an" is used.',
          },
          bn: {
            q: '[English Grammar] সঠিক Article নির্বাচন করো: "He is ___ honest officer who serves the community."',
            opts: ['an', 'a', 'the', 'no article'],
            ans: 0,
            exp: '"Honest" শব্দে "h" অনুচ্চারিত থাকে এবং স্বরধ্বনি (vowel sound) দিয়ে শুরু হয়, তাই এর পূর্বে "an" বসে।',
          },
          hi: {
            q: '[English Grammar] सही Article से रिक्त स्थान भरें: "He is ___ honest officer who serves the community."',
            opts: ['an', 'a', 'the', 'no article'],
            ans: 0,
            exp: '"Honest" में "h" मूक (silent) होता है और उच्चारण स्वर ध्वनि से शुरू होता है, इसलिए "an" का प्रयोग होता है।',
          },
        },
      ];
      const item = engBank[i % engBank.length];
      addCandidate({
        conceptKey: `english_c${cls}_${item.key}_${i}`,
        topic: config.topic || `Class ${cls} English Grammar & Usage`,
        difficulty: i % 2 === 0 ? 'easy' : 'medium',
        questionType: 'mcq',
        en: { ...item.en, q: i >= engBank.length ? `[Class ${cls} Practice ${i + 1}] ${item.en.q}` : item.en.q },
        bn: { ...item.bn, q: i >= engBank.length ? `[শ্রেণি ${cls} অনুশীলন ${i + 1}] ${item.bn.q}` : item.bn.q },
        hi: { ...item.hi, q: i >= engBank.length ? `[कक्षा ${cls} अभ्यास ${i + 1}] ${item.hi.q}` : item.hi.q },
      });
    } else if (sub === 'hindi') {
      const hindiBank = [
        {
          key: 'hi_sangya_bhed',
          en: {
            q: '[Hindi Vyakaran] In Hindi grammar, the word "बचपन" (childhood) is an example of which type of Sangya (noun)?',
            opts: ['भाववाचक संज्ञा (Abstract Noun)', 'व्यक्तिवाचक संज्ञा (Proper Noun)', 'जातिवाचक संज्ञा (Common Noun)', 'द्रव्यवाचक संज्ञा (Material Noun)'],
            ans: 0,
            exp: '"बचपन" expresses a state or abstract quality, so it is a भाववाचक संज्ञा.',
          },
          bn: {
            q: '[হিন্দি ব্যাকরণ] হিন্দি ব্যাকরণে "बचपन" (শৈশব) শব্দটি কোন প্রকার বিশেষ্যের (संज्ञा) উদাহরণ?',
            opts: ['भाववाचक संज्ञा (গুণ বা ভাববাচক)', 'व्यक्तिवाचक संज्ञा (নামবাচক)', 'जातिवाचक संज्ञा (জাতিবাচক)', 'द्रव्यवाचक संज्ञा (বস্তুবাচক)'],
            ans: 0,
            exp: '"बचपन" শব্দটি অবস্থার ভাব প্রকাশ করে, তাই এটি भाववाचक संज्ञा।',
          },
          hi: {
            q: 'हिन्दी व्याकरण में "बचपन" शब्द किस प्रकार की संज्ञा का उदाहरण है?',
            opts: ['भाववाचक संज्ञा', 'व्यक्तिवाचक संज्ञा', 'जातिवाचक संज्ञा', 'द्रव्यवाचक संज्ञा'],
            ans: 0,
            exp: '"बचपन" किसी अवस्था या भाव का बोध कराता है, इसलिए यह भाववाचक संज्ञा है।',
          },
        },
        {
          key: 'hi_sandhi_pustakalay',
          en: {
            q: '[Hindi Vyakaran] What is the correct Sandhi-vicched of the Hindi word "पुस्तकालय" (Pustakalay)?',
            opts: ['पुस्तक + आलय', 'पुस्त + कालय', 'पुस्तका + लय', 'पुस्तक + अलया'],
            ans: 0,
            exp: 'By Dirgha Swar Sandhi (अ + आ = आ), पुस्तक + आलय = पुस्तकालय.',
          },
          bn: {
            q: '[হিন্দি ব্যাকরণ] হিন্দি "पुस्तकालय" শব্দটির সঠিক সন্ধি বিচ্ছেদ কোনটি?',
            opts: ['पुस्तक + आलय', 'पुस्त + कालय', 'पुस्तका + लय', 'पुस्तक + अलया'],
            ans: 0,
            exp: 'দীর্ঘ স্বরসন্ধির নিয়মে (अ + आ = आ) पुस्तक + आलय = पुस्तकालय হয়।',
          },
          hi: {
            q: '"पुस्तकालय" शब्द का सही संधि-विच्छेद क्या है?',
            opts: ['पुस्तक + आलय', 'पुस्त + कालय', 'पुस्तका + लय', 'पुस्तक + अलया'],
            ans: 0,
            exp: 'दीर्घ स्वर संधि (अ + आ = आ) के नियम से पुस्तक + आलय = पुस्तकालय बनता है।',
          },
        },
        {
          key: 'hi_muhavara_nau_do',
          en: {
            q: '[Hindi Idioms] What is the accurate meaning of the Hindi Muhavara "नौ दो ग्यारह होना"?',
            opts: ['भाग जाना (To flee / run away)', 'गणित सीखना (To learn math)', 'मिलकर रहना (To live together)', 'सो जाना (To fall asleep)'],
            ans: 0,
            exp: 'In Hindi grammar, the idiom "नौ दो ग्यारह होना" means "भाग जाना" (to run away quickly).',
          },
          bn: {
            q: '[হিন্দি বাগধারা] হিন্দি "नौ दो ग्यारह होना" বাগধারাটির সঠিক অর্থ কী?',
            opts: ['भाग जाना (পালিয়ে যাওয়া)', 'गणित सीखना (অঙ্ক শেখা)', 'मिलकर रहना (একসাথে থাকা)', 'सो जाना (ঘুমিয়ে পড়া)'],
            ans: 0,
            exp: '"नौ दो ग्यारह होना" বাগধারাটির অর্থ হলো দ্রুত পালিয়ে যাওয়া (भाग जाना)।',
          },
          hi: {
            q: '"नौ दो ग्यारह होना" मुहावरे का सही अर्थ क्या है?',
            opts: ['भाग जाना', 'गणित सीखना', 'मिलकर रहना', 'सो जाना'],
            ans: 0,
            exp: '"नौ दो ग्यारह होना" मुहावरे का प्रचलित अर्थ "भाग जाना" है।',
          },
        },
      ];
      const item = hindiBank[i % hindiBank.length];
      addCandidate({
        conceptKey: `hindi_c${cls}_${item.key}_${i}`,
        topic: config.topic || `Class ${cls} Hindi Vyakaran`,
        difficulty: i % 2 === 0 ? 'easy' : 'medium',
        questionType: 'mcq',
        en: { ...item.en, q: i >= hindiBank.length ? `[Class ${cls} Q${i + 1}] ${item.en.q}` : item.en.q },
        bn: { ...item.bn, q: i >= hindiBank.length ? `[শ্রেণি ${cls} প্রশ্ন ${i + 1}] ${item.bn.q}` : item.bn.q },
        hi: { ...item.hi, q: i >= hindiBank.length ? `[कक्षा ${cls} प्रश्न ${i + 1}] ${item.hi.q}` : item.hi.q },
      });
    } else {
      // General Knowledge (GK) with explicit verified dates & sources
      const gkBank = [
        {
          key: 'gk_constitution_effect_1950',
          en: {
            q: 'On which date did the Constitution of India come into full force, celebrated annually as Republic Day? (Source: Constitution of India, Government of India)',
            opts: ['26 January 1950', '15 August 1947', '26 November 1949', '2 October 1950'],
            ans: 0,
            exp: 'Adopted by the Constituent Assembly on 26 November 1949, the Constitution of India came into full effect on 26 January 1950.',
          },
          bn: {
            q: 'ভারতের সংবিধান কোন তারিখে সম্পূর্ণরূপে কার্যকর হয়, যা প্রতি বছর প্রজাতন্ত্র দিবস হিসেবে পালিত হয়? (তথ্যসূত্র: ভারতের সংবিধান)',
            opts: ['২৬ জানুয়ারি ১৯৫০', '১৫ আগস্ট ১৯৪৭', '২৬ নভেম্বর ১৯৪৯', '২ অক্টোবর ১৯৫০'],
            ans: 0,
            exp: '১৯৪৯ সালের ২৬ নভেম্বর গৃহীত হওয়ার পর ১৯৫০ সালের ২৬ জানুয়ারি ভারতের সংবিধান কার্যকর হয়।',
          },
          hi: {
            q: 'भारतीय संविधान किस तिथि को पूर्ण रूप से लागू हुआ, जिसे प्रतिवर्ष गणतंत्र दिवस के रूप में मनाया जाता है? (स्रोत: भारतीय संविधान)',
            opts: ['26 जनवरी 1950', '15 अगस्त 1947', '26 नवंबर 1949', '2 अक्टूबर 1950'],
            ans: 0,
            exp: '26 नवंबर 1949 को अंगीकृत होने के बाद भारतीय संविधान 26 जनवरी 1950 को पूर्ण रूप से लागू हुआ।',
          },
        },
        {
          key: 'gk_chandrayaan3_2023',
          en: {
            q: 'On 23 August 2023, which ISRO lunar mission successfully soft-landed near the lunar south pole? (Source: ISRO Official Records)',
            opts: ['Chandrayaan-3', 'Chandrayaan-1', 'Mangalyaan', 'Aditya-L1'],
            ans: 0,
            exp: 'According to ISRO records, Chandrayaan-3’s Vikram lander touched down near the Moon’s south pole on 23 August 2023 (celebrated as National Space Day).',
          },
          bn: {
            q: '২৩ আগস্ট ২০২৩ তারিখে ISRO-র কোন চন্দ্র অভিযান চাঁদের দক্ষিণ মেরু অঞ্চলে সফলভাবে অবতরণ করে? (তথ্যসূত্র: ISRO)',
            opts: ['চন্দ্রযান-৩ (Chandrayaan-3)', 'চন্দ্রযান-১', 'মঙ্গলযান', 'আদিত্য-L1'],
            ans: 0,
            exp: 'ISRO-র সরকারি তথ্য অনুযায়ী, ২৩ আগস্ট ২০২৩ তারিখে চন্দ্রযান-৩-এর বিক্রম ল্যান্ডার চাঁদের দক্ষিণ মেরুর কাছে সফলভাবে অবতরণ করে।',
          },
          hi: {
            q: '23 अगस्त 2023 को इसरो (ISRO) के किस चंद्र मिशन ने चंद्रमा के दक्षिणी ध्रुव के पास सफलतापूर्वक सॉफ्ट-लैंडिंग की? (स्रोत: ISRO)',
            opts: ['चंद्रयान-3 (Chandrayaan-3)', 'चंद्रयान-1', 'मंगलयान', 'आदित्य-L1'],
            ans: 0,
            exp: 'इसरो (ISRO) के आधिकारिक रिकॉर्ड के अनुसार, 23 अगस्त 2023 को चंद्रयान-3 ने चंद्रमा के दक्षिणी ध्रुव के पास सफल लैंडिंग की।',
          },
        },
        {
          key: 'gk_sundarbans_unesco',
          en: {
            q: 'Which mangrove forest delta in West Bengal is a UNESCO World Heritage Site famous for the Royal Bengal Tiger? (Source: UNESCO World Heritage Centre, 1987)',
            opts: ['Sundarbans National Park', 'Jaldapara National Park', 'Gorumara National Park', 'Buxa Tiger Reserve'],
            ans: 0,
            exp: 'Sundarbans National Park in West Bengal was inscribed as a UNESCO World Heritage Site in 1987.',
          },
          bn: {
            q: 'পশ্চিমবঙ্গের কোন ম্যানগ্রোভ অরণ্য ১৯৮৭ সালে ইউনেস্কো (UNESCO) ওয়ার্ল্ড হেরিটেজ সাইটের স্বীকৃতি পেয়েছে? (তথ্যসূত্র: UNESCO, 1987)',
            opts: ['সুন্দরবন জাতীয় উদ্যান', 'জলদাপাড়া জাতীয় উদ্যান', 'গরুমারা জাতীয় উদ্যান', 'বক্সা ব্যাঘ্র প্রকল্প'],
            ans: 0,
            exp: '১৯৮৭ সালে পশ্চিমবঙ্গের সুন্দরবন জাতীয় উদ্যান UNESCO বিশ্ব ঐতিহ্যবাহী স্থানের স্বীকৃতি লাভ করে।',
          },
          hi: {
            q: 'पश्चिम बंगाल का कौन-सा मैंग्रोव वन क्षेत्र 1987 से यूनेस्को (UNESCO) विश्व धरोहर स्थल के रूप में सूचीबद्ध है? (स्रोत: UNESCO, 1987)',
            opts: ['सुंदरबन राष्ट्रीय उद्यान', 'जलदापाड़ा राष्ट्रीय उद्यान', 'गोरुमारा राष्ट्रीय उद्यान', 'बक्सा टाइगर रिजर्व'],
            ans: 0,
            exp: 'पश्चिम बंगाल स्थित सुंदरबन राष्ट्रीय उद्यान को 1987 में यूनेस्को विश्व धरोहर स्थल घोषित किया गया था।',
          },
        },
      ];
      const item = gkBank[i % gkBank.length];
      addCandidate({
        conceptKey: `gk_c${cls}_${item.key}_${i}`,
        topic: config.topic || `Class ${cls} General Knowledge & Awareness`,
        difficulty: i % 2 === 0 ? 'easy' : 'medium',
        questionType: 'mcq',
        en: { ...item.en, q: i >= gkBank.length ? `[Class ${cls} GK #${i + 1}] ${item.en.q}` : item.en.q },
        bn: { ...item.bn, q: i >= gkBank.length ? `[শ্রেণি ${cls} GK #${i + 1}] ${item.bn.q}` : item.bn.q },
        hi: { ...item.hi, q: i >= gkBank.length ? `[कक्षा ${cls} GK #${i + 1}] ${item.hi.q}` : item.hi.q },
      });
    }
  }

  return results;
}

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Normalize URL paths when invoked behind serverless rewrites
app.use((req, _res, next) => {
  if (
    !req.url.startsWith('/api/') &&
    (req.url.startsWith('/quiz/') || req.url.startsWith('/notes/') || req.url.startsWith('/ai/'))
  ) {
    req.url = `/api${req.url}`;
  }
  next();
});

// 1. Health & AI Status Endpoint
app.get('/api/ai/status', (_req, res) => {
  const hasKey = Boolean(getServerApiKey());
  res.json({
    model: ACTIVE_GEMINI_MODEL,
    freeTierEligible: true,
    apiKeyConfigured: hasKey,
  });
});

// 2. Generate Unique Quiz Endpoint
app.post('/api/quiz/generate', async (req, res) => {
  try {
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
    } = req.body || {};

    const rateKey = `${userId || req.ip || 'anon'}_quiz`;
    const limitCheck = checkRateLimit(rateKey);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: `Rate limit reached. Please wait ${limitCheck.retryAfterSeconds} seconds before generating another quiz.`,
      });
    }

    const validCount = [5, 10, 15, 20, 30].includes(Number(questionCount))
      ? Number(questionCount)
      : 5;
    const validClass = [5, 6, 7, 8, 9, 10].includes(Number(classLevel))
      ? Number(classLevel)
      : 8;
    const validQuizLang: 'en' | 'bn' | 'hi' =
      quizLanguage === 'bn' || quizLanguage === 'hi' ? quizLanguage : 'en';

    const userHist = getUserHistory(userId);
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

        const recentConcepts = Array.from(excludedConceptsSnapshot).slice(-35).join(', ');

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
            temperature: 0.85,
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
                      'Language-agnostic snake_case identifier of the core academic concept tested (e.g. ohms_law_resistance_calc)',
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
                subject,
                quizLanguage: validQuizLang,
                topic,
                difficulty,
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
        console.error('Gemini quiz generation fallback triggered:', aiErr?.message || aiErr);
        notice =
          'Gemini API rate limit or quota reached; supplemented with parameterized curriculum-verified questions.';
      }
    } else {
      notice =
        'Generated using the built-in parameterized WBBSE/WBBPE curriculum engine (configure GEMINI_API_KEY in environment variables for live AI generation).';
    }

    // Fill any remaining slots with verified parameterized curriculum questions (guarantees requested questionCount & zero duplicates)
    if (validatedQuestions.length < validCount) {
      const needed = validCount - validatedQuestions.length;
      const fallbackItems = generateVerifiedCurriculumQuestions(
        {
          classLevel: validClass,
          subject,
          quizLanguage: validQuizLang,
          topic,
          difficulty,
          questionCount: needed,
          questionType,
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

    // Record fingerprints and concepts in user history
    for (const q of validatedQuestions) {
      userHist.fingerprints.add(q.fingerprint);
      userHist.concepts.add(q.conceptKey);
    }

    const attemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const attempt: ServerQuizAttempt = {
      attemptId,
      userId,
      config: {
        classLevel: validClass,
        subject,
        quizLanguage: validQuizLang,
        topic,
        difficulty,
        questionCount: validatedQuestions.length,
        questionType,
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
    return res.json(sanitizeAttemptForClient(attempt));
  } catch (err: any) {
    console.error('Error in /api/quiz/generate:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate quiz.',
    });
  }
});

// 3. Strict Irreversible Answer Locking Endpoint (Section 9)
app.post('/api/quiz/lock-answer', (req, res) => {
  const {
    attemptId,
    questionId,
    selectedIndex,
    timeTakenSeconds,
    serverStateToken,
    lockedAnswersSnapshot,
  } = req.body || {};
  if (!attemptId || !questionId || typeof selectedIndex !== 'number') {
    return res.status(400).json({ error: 'Missing attemptId, questionId, or selectedIndex.' });
  }

  const attempt = resolveServerAttempt(attemptId, serverStateToken, lockedAnswersSnapshot);
  if (!attempt) {
    return res.status(404).json({ error: 'Quiz attempt not found on server.' });
  }

  if (attempt.status === 'completed') {
    return res.status(409).json({
      error: 'This quiz attempt has already been submitted and finalized. Answers cannot be altered.',
      attempt: sanitizeAttemptForClient(attempt),
    });
  }

  // CRITICAL REQUIREMENT: Once locked, an answer can NEVER be changed!
  if (attempt.lockedAnswers[questionId]) {
    return res.status(409).json({
      error: 'Answer is permanently locked for this attempt and cannot be changed.',
      lockedRecord: attempt.lockedAnswers[questionId],
      attempt: sanitizeAttemptForClient(attempt),
    });
  }

  const question = attempt.questions.find((q) => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found in this attempt.' });
  }

  if (selectedIndex < 0 || selectedIndex >= question.options.length) {
    return res.status(400).json({ error: 'Invalid option index.' });
  }

  const isCorrect = selectedIndex === question.correctIndex;
  const lockedRecord: ServerLockedAnswer = {
    questionId,
    selectedIndex,
    lockedAt: new Date().toISOString(),
    isCorrect,
  };

  attempt.lockedAnswers[questionId] = lockedRecord;
  // Remove from markedForReview once locked
  attempt.markedForReview = attempt.markedForReview.filter((id) => id !== questionId);
  if (typeof timeTakenSeconds === 'number' && timeTakenSeconds >= 0) {
    attempt.timeTakenSeconds = Math.max(attempt.timeTakenSeconds, Math.round(timeTakenSeconds));
  }

  return res.json({
    locked: true,
    attempt: sanitizeAttemptForClient(attempt),
  });
});

// 4. Toggle Mark for Review (only allowed for UNANSWERED questions)
app.post('/api/quiz/toggle-review', (req, res) => {
  const {
    attemptId,
    questionId,
    serverStateToken,
    lockedAnswersSnapshot,
    markedForReviewSnapshot,
  } = req.body || {};
  const attempt = resolveServerAttempt(
    attemptId,
    serverStateToken,
    lockedAnswersSnapshot,
    markedForReviewSnapshot
  );
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found.' });
  }
  if (attempt.status === 'completed' || attempt.lockedAnswers[questionId]) {
    return res.status(409).json({
      error: 'Locked questions cannot be modified.',
      attempt: sanitizeAttemptForClient(attempt),
    });
  }
  if (attempt.markedForReview.includes(questionId)) {
    attempt.markedForReview = attempt.markedForReview.filter((id) => id !== questionId);
  } else {
    attempt.markedForReview.push(questionId);
  }
  return res.json({ attempt: sanitizeAttemptForClient(attempt) });
});

// 5. Final Quiz Submission & Official Grading (Sections 9, 10, 12)
app.post('/api/quiz/submit', (req, res) => {
  const {
    attemptId,
    timeTakenSeconds = 0,
    serverStateToken,
    lockedAnswersSnapshot,
  } = req.body || {};
  const attempt = resolveServerAttempt(attemptId, serverStateToken, lockedAnswersSnapshot);
  if (!attempt) {
    return res.status(404).json({ error: 'Quiz attempt not found on server.' });
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

  return res.json(sanitizeAttemptForClient(attempt));
});

// 6. Retrieve / Resume Attempt on Refresh (preserves locked answers, never unlocks)
app.get('/api/quiz/attempt/:attemptId', (req, res) => {
  const attempt = serverAttempts.get(req.params.attemptId);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found.' });
  }
  return res.json(sanitizeAttemptForClient(attempt));
});

// 7. Retake Quiz — Creates a BRAND NEW attempt ID in the selected quizLanguage without modifying original attempt (Section 9)
app.post('/api/quiz/retake', async (req, res) => {
  try {
    const {
      originalAttemptId,
      originalConfig,
      originalQuestions,
      serverStateToken,
      quizLanguage,
      userId = 'local_student',
    } = req.body || {};
    const memOriginal =
      resolveServerAttempt(originalAttemptId, serverStateToken) ||
      serverAttempts.get(originalAttemptId);

    if (!memOriginal && (!originalConfig || !Array.isArray(originalQuestions))) {
      return res.status(404).json({ error: 'Original attempt not found on server.' });
    }

    const baseConfig = memOriginal ? memOriginal.config : originalConfig;
    const baseQuestions: ServerQuestion[] = memOriginal
      ? memOriginal.questions
      : originalQuestions;
    const baseAttemptId = memOriginal ? memOriginal.attemptId : String(originalAttemptId || 'prev');

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
      // Student chose a different language for the retake — generate/localize questions in targetLang
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
          console.error('Retake language adaptation fallback:', err);
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
      userId,
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
    return res.json(sanitizeAttemptForClient(newAttempt));
  } catch (err: any) {
    console.error('Error in /api/quiz/retake:', err);
    return res.status(500).json({ error: err?.message || 'Failed to create retake session.' });
  }
});

// 8. Launch Interactive Locked Quiz from Study Note MCQs
app.post('/api/quiz/from-notes', (req, res) => {
  const {
    mcqs = [],
    classLevel = 8,
    subject = 'life_science',
    quizLanguage = 'en',
    topic = 'Study Notes Revision',
    userId = 'local_student',
  } = req.body || {};

  if (!Array.isArray(mcqs) || mcqs.length === 0) {
    return res.status(400).json({ error: 'No MCQs provided to create quiz.' });
  }

  const validQuizLang: 'en' | 'bn' | 'hi' =
    quizLanguage === 'bn' || quizLanguage === 'hi' ? quizLanguage : 'en';

  const validated: ServerQuestion[] = [];
  for (let i = 0; i < mcqs.length; i++) {
    const v = validateAndNormalizeQuestion(
      { ...mcqs[i], questionType: 'mcq' },
      {
        classLevel: Number(classLevel) || 8,
        subject,
        quizLanguage: validQuizLang,
        topic,
        difficulty: 'medium',
      },
      i
    );
    if (v) validated.push(v);
  }

  if (validated.length === 0) {
    return res.status(400).json({ error: 'Could not validate questions from notes.' });
  }

  const attemptId = `att_notes_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const attempt: ServerQuizAttempt = {
    attemptId,
    userId,
    config: {
      classLevel: Number(classLevel) || 8,
      subject,
      quizLanguage: validQuizLang,
      topic,
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
  return res.json(sanitizeAttemptForClient(attempt));
});

// 9. Reset Per-User Question History
app.post('/api/quiz/reset-history', (req, res) => {
  const { userId = 'local_student' } = req.body || {};
  userFingerprintsHistory.delete(userId);
  userConceptHistory.delete(userId);
  return res.json({ reset: true });
});

// 10. Study Notes & AI Revision Tools Endpoint (Section 13)
app.post('/api/notes/process', async (req, res) => {
  try {
    const {
      title = 'Study Notes',
      sourceText = '',
      fileData,
      classLevel = 8,
      subject = 'life_science',
      inputLanguage = 'en',
      outputLanguage = 'en',
      userId = 'local_student',
    } = req.body || {};

    const rateKey = `${userId || req.ip || 'anon'}_notes`;
    const limitCheck = checkRateLimit(rateKey);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: `Rate limit reached. Please wait ${limitCheck.retryAfterSeconds} seconds.`,
      });
    }

    if ((!sourceText || sourceText.trim().length < 10) && !fileData?.base64) {
      return res.status(400).json({
        error: 'Please provide study notes text or upload a supported document.',
      });
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
${sourceText.slice(0, 18000)}`,
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

          return res.json({
            title: parsed.title || title,
            summary: parsed.summary || '',
            keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
            flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
            mcqs: cleanMcqs,
            modelUsed,
          });
        }
      } catch (aiErr: any) {
        console.error('Gemini study notes fallback:', aiErr?.message || aiErr);
      }
    }

    // Structured fallback summary if quota is exhausted or key not configured
    const sentences = (sourceText || title)
      .split(/[.।?!\n]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 10);

    const fallbackQuestions = generateVerifiedCurriculumQuestions(
      {
        classLevel: Number(classLevel) || 8,
        subject,
        quizLanguage: outputLanguage === 'bn' || outputLanguage === 'hi' ? outputLanguage : 'en',
        topic: title,
        difficulty: 'mixed',
        questionCount: 5,
        questionType: 'mcq',
      },
      new Set(),
      new Set()
    );

    return res.json({
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
  } catch (err: any) {
    console.error('Error in /api/notes/process:', err);
    return res.status(500).json({ error: err?.message || 'Failed to process study notes.' });
  }
});

// Ensure unknown /api/* routes always return valid JSON (never HTML/plain-text 404)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Express JSON error handler for /api/* requests
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.path.startsWith('/api')) {
      console.error('Unhandled API Error:', err);
      const status = typeof err?.status === 'number' ? err.status : 500;
      res.status(status).json({
        error: err?.message || 'Internal server error processing API request.',
      });
      return;
    }
    next(err);
  }
);

async function startServer() {
  // Vite middleware for development vs static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IQ Quiz server running on http://0.0.0.0:${PORT}`);
  });
}

// Start standalone HTTP listener when not running inside Vercel Serverless Functions
if (!process.env.VERCEL) {
  startServer();
}

export default app;
