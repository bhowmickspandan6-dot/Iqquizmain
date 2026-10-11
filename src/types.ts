export type LanguageCode = 'en' | 'bn' | 'hi';

export type ClassLevel = 5 | 6 | 7 | 8 | 9 | 10;

export type SubjectId =
  | 'bangla'
  | 'english'
  | 'mathematics'
  | 'hindi'
  | 'physical_science'
  | 'life_science'
  | 'gk';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';

export type QuestionTypeFilter = 'mcq' | 'tf' | 'mixed';

export type QuizQuestionCount = 5 | 10 | 15 | 20 | 30 | 50;

export type QuizDuration = 0 | 3 | 7 | 10 | 15 | 20 | 25 | 30 | 45;

export type QuizMode = 'practice' | 'timed' | 'exam' | 'challenge' | 'test';

export type SelectableQuizMode = 'practice' | 'timed' | 'exam' | 'challenge';

export function normalizeQuizMode(mode?: string): SelectableQuizMode {
  if (mode === 'practice') return 'practice';
  if (mode === 'timed') return 'timed';
  if (mode === 'challenge') return 'challenge';
  if (mode === 'exam' || mode === 'test') return 'exam';
  return 'timed';
}

export function isTimedQuizMode(mode?: string): boolean {
  return normalizeQuizMode(mode) !== 'practice';
}

export function doesModeHideAnswersUntilCompleted(mode?: string): boolean {
  return normalizeQuizMode(mode) === 'exam';
}

export const QUIZ_QUESTION_COUNTS = [5, 10, 20, 30, 50] as const;

export const QUIZ_TIMER_MINUTES_BY_COUNT: Record<number, QuizDuration> = {
  5: 3,
  10: 7,
  15: 10,
  20: 15,
  30: 25,
  50: 45,
};

/**
 * Returns the official exam timer duration (in minutes) for a given question count:
 * - 5 questions: 3 minutes
 * - 10 questions: 7 minutes
 * - 20 questions: 15 minutes
 * - 30 questions: 25 minutes
 * - 50 questions: 45 minutes
 */
export function getTimerMinutesForQuestionCount(questionCount: number): QuizDuration {
  if (questionCount in QUIZ_TIMER_MINUTES_BY_COUNT) {
    return QUIZ_TIMER_MINUTES_BY_COUNT[questionCount];
  }
  if (questionCount <= 5) return 3;
  if (questionCount <= 10) return 7;
  if (questionCount <= 20) return 15;
  if (questionCount <= 30) return 25;
  return 45;
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

export interface QuizConfig {
  classLevel: ClassLevel;
  subject: SubjectId;
  quizLanguage: LanguageCode;
  topic: string;
  difficulty: DifficultyLevel;
  questionCount: QuizQuestionCount;
  questionType: QuestionTypeFilter;
  durationMinutes: QuizDuration;
  mode: QuizMode;
}

export interface QuizQuestionClient {
  id: string;
  fingerprint: string;
  structuralHash?: string;
  conceptKey: string;
  classLevel: ClassLevel;
  subject: SubjectId;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: LanguageCode;
  questionType: 'mcq' | 'tf';
  questionText: string;
  options: string[];
  hint?: string;
  // Populated after locking in Practice/Timed/Challenge Mode or after final submission in Exam Mode
  correctIndex?: number;
  explanation?: string;
}

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

export interface LockedAnswerRecord {
  questionId: string;
  selectedIndex: number;
  lockedAt: string;
  // Populated immediately upon lock except in Exam Mode where it is populated after final submit
  isCorrect?: boolean;
  correctIndex?: number;
  explanation?: string;
}

export interface TopicPerformanceItem {
  topic: string;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number;
}

export interface QuizScoreSummary {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeTakenSeconds: number;
  topicBreakdown: TopicPerformanceItem[];
}

export interface QuizAttemptState {
  attemptId: string;
  parentAttemptId?: string;
  userId: string;
  config: QuizConfig;
  questions: QuizQuestionClient[];
  lockedAnswers: Record<string, LockedAnswerRecord>;
  markedForReview: string[];
  status: 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  timeTakenSeconds: number;
  timerStartedAtMs?: number;
  timerEndsAtMs?: number;
  scoreSummary?: QuizScoreSummary;
  serverStateToken?: string;
  generationInfo: {
    model: string;
    source: 'gemini-ai' | 'verified-curriculum-engine';
    excludedHistoryCount: number;
    uniqueConceptsCount: number;
    notice?: string;
  };
}

export interface StudyNoteConcept {
  term: string;
  explanation: string;
  example: string;
}

export interface StudyNoteFlashcard {
  front: string;
  back: string;
}

export interface StudyNoteAnalysis {
  title: string;
  summary: string;
  keyConcepts: StudyNoteConcept[];
  flashcards: StudyNoteFlashcard[];
  mcqs: {
    id: string;
    questionText: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  modelUsed: string;
  notice?: string;
}

export interface SavedStudyNote {
  noteId: string;
  userId: string;
  title: string;
  classLevel: ClassLevel;
  subject: SubjectId;
  inputLanguage: LanguageCode;
  outputLanguage: LanguageCode;
  sourceText: string;
  analysis: StudyNoteAnalysis;
  createdAt: string;
}

export type ChatLanguagePreference = 'auto' | LanguageCode;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: LanguageCode;
  modelUsed?: string;
}

export interface ChatConversation {
  chatId: string;
  userId: string;
  title: string;
  language: LanguageCode;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
