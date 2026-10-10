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

export type QuizDuration = 0 | 10 | 20 | 30;

export type QuizMode = 'practice' | 'test';

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
  questionCount: 5 | 10 | 15 | 20 | 30;
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
  // Only populated after locking in Practice Mode or after final submission in Test Mode
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
  // Populated in Practice Mode immediately upon lock, or in Test Mode after final submit
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

