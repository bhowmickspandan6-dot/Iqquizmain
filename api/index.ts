import 'dotenv/config';
import crypto from 'crypto';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

// Official supported Gemini Flash models (fast, free-tier eligible, structured JSON output supported)
const SUPPORTED_GEMINI_MODELS = [
  'gemini-3-flash-preview',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];
const configuredModel = (process.env.GEMINI_MODEL || '').trim();
const ACTIVE_GEMINI_MODEL = SUPPORTED_GEMINI_MODELS.includes(configuredModel)
  ? configuredModel
  : 'gemini-3-flash-preview';

// Per-call timeout and bounded replacement passes so serverless functions never hang or loop infinitely
const GEMINI_TIMEOUT_MS = 15000;
const MAX_GENERATION_PASSES = 3;

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
  }
): Promise<{ response: any; modelUsed: string }> {
  const candidateModels = Array.from(
    new Set([ACTIVE_GEMINI_MODEL, ...SUPPORTED_GEMINI_MODELS])
  );
  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const modelName = candidateModels[i];
    try {
      // Configure low-latency thinking per model family so structured JSON generation completes in ~2-4s
      const thinkingConfig = modelName.startsWith('gemini-3')
        ? { thinkingLevel: ThinkingLevel.LOW }
        : modelName.startsWith('gemini-2.5')
        ? { thinkingBudget: 0 }
        : undefined;

      const mergedConfig = {
        ...(params.config || {}),
        ...(thinkingConfig ? { thinkingConfig } : {}),
      };

      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: mergedConfig,
        }),
        GEMINI_TIMEOUT_MS,
        `Gemini generateContent (${modelName})`
      );
      return { response, modelUsed: modelName };
    } catch (err: any) {
      lastError = err;
      logServerError(`Gemini model ${modelName} call failed`, err, { modelName, attempt: i + 1 });
      const msg = String(err?.message || err || '').toLowerCase();
      // If API key itself is invalid, fail immediately
      if (msg.includes('api_key_invalid') || msg.includes('api key not valid')) {
        break;
      }
      // Brief backoff before trying the next fallback model
      if (i < candidateModels.length - 1) {
        await sleep(250);
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
      structuralHash: q.structuralHash,
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
      ? `সঠিক উত্তর হলো "${options[correctIndex]}" কারণ এটি পাঠ্যক্রমের তথ্যের সাথে সামঞ্জস্যপূর্ণ।`
      : config.quizLanguage === 'hi'
      ? `सही उत्तर "${options[correctIndex]}" है क्योंकि यह पाठ्यक्रम के सिद्धांत के अनुरूप है।`
      : `The correct answer is "${options[correctIndex]}" based on verified curriculum principles.`;

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

  return {
    id: `q_${config.classLevel}_${config.subject}_${fp}_${index}`,
    fingerprint: fp,
    structuralHash: sHash,
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
// DYNAMIC GEMINI QUIZ GENERATION WITH MULTI-PASS DUPLICATE REPLACEMENT
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

  // Select diverse curriculum subtopics and rotate cognitive angles for this attempt
  const fullSubtopicPool = SUBJECT_SUBTOPIC_POOL[subject] || SUBJECT_SUBTOPIC_POOL.gk;
  const randomSeedNumber = crypto.randomBytes(4).readUInt32BE(0);
  const rotatedSubtopics = fullSubtopicPool
    .map((item, idx) => ({
      item,
      score: ((idx * 31 + randomSeedNumber) % 997),
    }))
    .sort((a, b) => a.score - b.score)
    .map((x) => x.item);

  for (let pass = 1; pass <= MAX_GENERATION_PASSES; pass++) {
    const remainingNeeded = questionCount - acceptedQuestions.length;
    if (remainingNeeded <= 0) break;

    // Request a small buffer (+2) so if 1-2 items are similar to history, we still complete in Pass 1
    const batchRequestCount =
      pass === 1
        ? Math.min(remainingNeeded + 2, 32)
        : Math.min(remainingNeeded + 3, 15);

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
    for (let s = 0; s < batchRequestCount; s++) {
      const subtopicChoice =
        topic && topic !== 'All Verified Chapters'
          ? `${topic} — Focus Aspect #${((randomSeedNumber + s + pass * 7) % 12) + 1}`
          : rotatedSubtopics[(s + (pass - 1) * 5) % rotatedSubtopics.length];
      const angleChoice =
        COGNITIVE_REASONING_ANGLES[(randomSeedNumber + s + pass * 3) % COGNITIVE_REASONING_ANGLES.length];
      slotAssignments.push(
        `- Question ${s + 1}: Subtopic Focus = [${subtopicChoice}] | Reasoning Task = [${angleChoice}]`
      );
    }

    const systemInstruction = `You are a senior academic curriculum examiner for Classes 5 to 10 (WBBPE/WBBSE & National standard).
CRITICAL GENERATION RULES:
1. Subject Independence: The academic subject being tested is "${subject}". The presentation language (Quiz Language) is "${langName}".
2. Even if the subject is Bangla, English, or Hindi, you MUST write the question stem, options, hint, and explanation strictly in "${langName}" while testing the academic curriculum of "${subject}" for Class ${classLevel}.
3. Every question must be 100% factually, scientifically, and mathematically accurate for Class ${classLevel}. Double-check all calculations so the option at correctIndex is indisputably right.
4. ZERO DUPLICATES & HIGH DIVERSITY: Never repeat or paraphrase any previously asked question stem or concept key listed in the prompt. Vary the concepts, scenarios, examples, numerical values, and reasoning tasks across every question.
5. For questionType "${questionType}": if "mcq", provide 4 distinct, plausible options and correctIndex (0-3). If "tf", provide 2 options (True/False in ${langName}) and correctIndex (0 or 1). If "mixed", include a mix of "mcq" and "tf" questions.`;

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

    const prompt = `${
      pass > 1
        ? `[REPLACEMENT GENERATION PASS #${pass}]: Some questions in the previous pass overlapped with the student's quiz history. Generate ${batchRequestCount} BRAND-NEW, completely different replacement questions.\n`
        : ''
    }Generate exactly ${batchRequestCount} unique, fresh quiz questions for:
- Class Level: Class ${classLevel}
- Academic Subject: ${subject}
- Selected Topic/Chapter: ${topic}
- Difficulty Level: ${difficulty}
- Question Type: ${questionType}
- Presentation Language: ${langName} (language code: ${quizLanguage})
- Cryptographic Entropy Seed: ${Date.now()}_${randomSeedNumber}_pass${pass}

REQUIRED SUBTOPIC & REASONING TASK DIVERSITY PLAN FOR THIS BATCH:
${slotAssignments.join('\n')}
${exclusionSection}`;

    const { response, modelUsed } = await generateContentWithModelFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        temperature: pass === 1 ? 0.9 : 0.95,
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

    for (const rawItem of candidateArray) {
      if (acceptedQuestions.length >= questionCount) break;

      const normalized = validateAndNormalizeQuestion(
        rawItem,
        {
          classLevel,
          subject,
          quizLanguage,
          topic,
          difficulty,
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
        // On the final pass only, if we still need questions to complete the requested count
        // and the question is not an exact fingerprint duplicate, accept it rather than failing the whole quiz
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

      // Unique & verified! Add to working sets and accepted list
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

    // 2. Generate Unique Quiz Endpoint (Dynamic Gemini AI + Multi-Layer Deduplication)
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

      const validCount = [5, 10, 15, 20, 30].includes(Number(questionCount))
        ? Number(questionCount)
        : 5;
      const validClass = [5, 6, 7, 8, 9, 10].includes(Number(classLevel))
        ? Number(classLevel)
        : 8;
      const validQuizLang: 'en' | 'bn' | 'hi' =
        quizLanguage === 'bn' || quizLanguage === 'hi' ? quizLanguage : 'en';
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
        const { questions, modelUsed, rejectedDuplicatesCount } =
          await generateFreshVerifiedQuizQuestions({
            ai,
            classLevel: validClass,
            subject: String(subject),
            quizLanguage: validQuizLang,
            topic: String(topic),
            difficulty: String(difficulty),
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

        const attemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const attempt: ServerQuizAttempt = {
          attemptId,
          userId: cleanUserId,
          config: {
            classLevel: validClass,
            subject: String(subject),
            quizLanguage: validQuizLang,
            topic: String(topic),
            difficulty: String(difficulty),
            questionCount: questions.length,
            questionType: String(questionType),
            durationMinutes: Number(durationMinutes) || 0,
            mode: mode === 'test' ? 'test' : 'practice',
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
          `[IQ Quiz Server] Fresh quiz generated | attemptId=${attemptId} | model=${modelUsed} | class=${validClass} | subject=${subject} | lang=${validQuizLang} | excludedHistory=${excludedFingerprintsSet.size} | rejectedSimilar=${rejectedDuplicatesCount}`
        );
        sendJson(res, 200, sanitizeAttemptForClient(attempt));
        return;
      } catch (aiErr: any) {
        logServerError('Gemini quiz generation failed in /api/quiz/generate', aiErr, {
          classLevel: validClass,
          subject,
          quizLanguage: validQuizLang,
        });
        const msg = String(aiErr?.message || aiErr || '').toLowerCase();
        if (msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('invalid api key')) {
          sendJson(res, 503, {
            error:
              'The configured GEMINI_API_KEY on the server was rejected by Google Gemini API. Please verify your GEMINI_API_KEY in Vercel Project Settings → Environment Variables and redeploy.',
          });
          return;
        }
        if (msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) {
          sendJson(res, 429, {
            error:
              'Gemini AI rate limit or quota reached. Please wait a few seconds and click Retry Quiz Generation.',
          });
          return;
        }
        sendJson(res, 503, {
          error:
            'Unable to reach Gemini AI right now to generate fresh questions. Please click Retry Quiz Generation.',
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
      const validCount = [5, 10, 15, 20, 30].includes(Number(baseConfig.questionCount))
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
        const { questions: retakeQuestions, modelUsed } =
          await generateFreshVerifiedQuizQuestions({
            ai,
            classLevel: validClass,
            subject: String(baseConfig.subject),
            quizLanguage: targetLang,
            topic: String(baseConfig.topic || 'All Verified Chapters'),
            difficulty: String(baseConfig.difficulty || 'mixed'),
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

        const newAttemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const newAttempt: ServerQuizAttempt = {
          attemptId: newAttemptId,
          parentAttemptId: baseAttemptId,
          userId: cleanUserId,
          config: {
            ...baseConfig,
            classLevel: validClass,
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
            model: modelUsed,
            source: 'gemini-ai',
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
