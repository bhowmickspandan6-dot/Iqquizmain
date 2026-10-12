export type LanguageCode = 'en' | 'bn' | 'hi';

export type ClassLevel = 5 | 6 | 7 | 8 | 9 | 10;

export type SubjectId =
  | 'mathematics'
  | 'science'
  | 'physical_science'
  | 'life_science'
  | 'history'
  | 'geography'
  | 'evs'
  | 'english'
  | 'bangla'
  | 'hindi'
  | 'hindi_subject'
  | 'history_geography'
  | 'gk';

export type CurriculumVerificationStatus = 'verified' | 'pending_verification';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';

export type QuestionTypeFilter = 'mcq' | 'tf' | 'mixed';

export type QuizQuestionCount = 5 | 10 | 15 | 20 | 30 | 50;

// Official Question-Count to Timer Duration mapping (in minutes):
// 5 Q -> 3m, 10 Q -> 7m, 15 Q -> 10m, 20 Q -> 15m, 30 Q -> 25m, 50 Q -> 45m, 0 -> Practice Mode (Untimed)
export type QuizDuration = 0 | 3 | 7 | 10 | 15 | 20 | 25 | 30 | 45;

export const QUIZ_QUESTION_COUNTS: QuizQuestionCount[] = [5, 10, 20, 30, 50];

export const QUESTION_COUNT_TIMER_MINUTES: Record<number, QuizDuration> = {
  5: 3,
  10: 7,
  15: 10,
  20: 15,
  30: 25,
  50: 45,
};

export function getTimerMinutesForQuestionCount(count: number): QuizDuration {
  if (count === 5) return 3;
  if (count === 10) return 7;
  if (count === 15) return 10;
  if (count === 20) return 15;
  if (count === 30) return 25;
  if (count === 50) return 45;
  return 3;
}

export type QuizMode = 'practice' | 'timed' | 'exam' | 'challenge' | 'test';

export type SelectableQuizMode = 'practice' | 'timed' | 'exam' | 'challenge';

export function normalizeQuizMode(mode?: string): SelectableQuizMode {
  if (mode === 'practice') return 'practice';
  if (mode === 'timed') return 'timed';
  if (mode === 'challenge') return 'challenge';
  if (mode === 'exam' || mode === 'test') return 'exam';
  return 'practice';
}

export function doesModeHideAnswersUntilCompleted(mode?: string): boolean {
  return normalizeQuizMode(mode) === 'exam';
}

export interface QuizConfig {
  classLevel: ClassLevel;
  subject: SubjectId;
  quizLanguage: LanguageCode;
  topic: string; // "All Verified Chapters" or specific chapter title
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  textbookName?: string;
  board?: 'WBBPE' | 'WBBSE';
  curriculumVerificationStatus?: CurriculumVerificationStatus;
  difficulty: DifficultyLevel;
  questionCount: number;
  questionType: QuestionTypeFilter;
  durationMinutes: QuizDuration;
  mode: QuizMode;
}

export interface LockedAnswerRecord {
  questionId: string;
  selectedIndex: number;
  lockedAt: string;
  isCorrect?: boolean;
  correctIndex?: number;
  explanation?: string;
  timeTakenSeconds?: number;
}

export interface QuizQuestion {
  id: string;
  questionNumber?: number;
  type?: 'mcq' | 'tf';
  questionType?: 'mcq' | 'tf';
  questionText: string;
  options: string[];
  topic: string;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  textbookName?: string;
  board?: 'WBBPE' | 'WBBSE';
  curriculumVerificationStatus?: CurriculumVerificationStatus;
  subjectId?: SubjectId;
  subject?: SubjectId | string;
  classLevel?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  language?: LanguageCode;
  fingerprint: string;
  structuralHash?: string;
  conceptKey?: string;
  hint?: string;
  // Only populated after question is locked (Practice Mode) or after full quiz submission (Test Mode)
  correctIndex?: number;
  explanation?: string;
}

// Persistent Question History item stored per user in localStorage & Firestore
export interface QuestionHistoryRecord {
  historyId: string;
  userId: string;
  classLevel: ClassLevel;
  subject: SubjectId;
  topic: string;
  difficulty: string;
  language: LanguageCode;
  fingerprint: string;
  structuralHash: string;
  conceptKey: string;
  questionText: string;
  options?: string[];
  createdAt: string;
}

export interface TopicPerformanceItem {
  topic: string;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy?: number;
  accuracyPercent?: number;
}

export interface QuizScoreSummary {
  totalQuestions: number;
  answeredCount?: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeTakenSeconds: number;
  completedAt?: string;
  topicBreakdown: TopicPerformanceItem[];
}

export interface QuizAttemptState {
  attemptId: string;
  parentAttemptId?: string; // Set if this attempt is a retake of an earlier attempt
  userId?: string;
  config: QuizConfig;
  status: 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  timeTakenSeconds?: number;
  questions: QuizQuestion[];
  lockedAnswers: Record<string, LockedAnswerRecord>;
  markedForReview: string[];
  scoreSummary?: QuizScoreSummary;
  // Signed stateless continuity token so active quizzes survive serverless cold starts
  serverStateToken?: string;
  // Absolute epoch timestamps (ms) persisted so countdown timer survives page refresh
  timerStartedAtMs?: number;
  timerEndsAtMs?: number;
  generationInfo?: {
    model: string;
    source: 'gemini-ai' | 'verified-curriculum-engine';
    board?: 'WBBPE' | 'WBBSE';
    textbookName?: string;
    syllabusCode?: string;
    verificationStatus?: CurriculumVerificationStatus;
    excludedHistoryCount?: number;
    uniqueConceptsCount?: number;
    notice?: string;
  };
}

export interface FlashcardItem {
  front: string;
  back: string;
}

export interface DifficultConceptItem {
  term: string;
  explanation: string;
  example?: string;
}

export interface StudyNoteAnalysis {
  title?: string;
  inputLanguage?: LanguageCode;
  outputLanguage?: LanguageCode;
  summary: string;
  summaryBullets?: string[];
  keyConcepts: DifficultConceptItem[];
  difficultConcepts?: DifficultConceptItem[];
  flashcards: FlashcardItem[];
  mcqs: {
    questionText: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  modelUsed?: string;
  notice?: string;
}

export interface SavedStudyNote {
  noteId: string;
  userId?: string;
  title: string;
  createdAt: string;
  classLevel: ClassLevel;
  subject: SubjectId;
  inputLanguage: LanguageCode;
  outputLanguage: LanguageCode;
  sourceText: string;
  sourceTextPreview?: string;
  analysis: StudyNoteAnalysis;
}

export type ChatLanguagePreference = 'auto' | LanguageCode;

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  detectedLanguage?: LanguageCode;
  language?: LanguageCode;
  modelUsed?: string;
}

export type ChatMessage = ChatMessageItem;

export interface ChatConversation {
  chatId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  language: LanguageCode;
  replyLanguage?: ChatLanguagePreference;
  messages: ChatMessageItem[];
}

export type NavSection =
  | 'dashboard'
  | 'ai_chat'
  | 'take_quiz'
  | 'practice_tests'
  | 'study_notes'
  | 'my_results'
  | 'progress'
  | 'settings';
