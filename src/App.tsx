import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  LayoutDashboard,
  PlayCircle,
  ClipboardList,
  BookOpenText,
  Award,
  TrendingUp,
  Settings,
  GraduationCap,
  Globe,
  Languages,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  LogIn,
  LogOut,
  Menu,
  X,
  ArrowRight,
  RefreshCw,
  Shuffle,
} from 'lucide-react';
import {
  ClassLevel,
  DifficultyLevel,
  LanguageCode,
  NavSection,
  QuestionHistoryRecord,
  QuestionTypeFilter,
  QuizAttemptState,
  QuizConfig,
  QuizDuration,
  QuizMode,
  SavedStudyNote,
  StudyNoteAnalysis,
  SubjectId,
} from './types';
import {
  CLASS_LEVELS,
  SUBJECT_LIST,
  getClassSubjectCurriculum,
  getSubjectDefinition,
} from './data/curriculum';
import { LANGUAGE_LABELS, t } from './i18n/translations';
import { ActiveQuizView } from './components/ActiveQuizView';
import { ResultsView } from './components/ResultsView';
import { StudyNotesView } from './components/StudyNotesView';
import {
  QuizLanguageModal,
  PendingQuizLaunch,
} from './components/QuizLanguageModal';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  syncUserProfileToFirestore,
  loadUserProfileFromFirestore,
  saveQuizAttemptToFirestore,
  saveStudyNoteToFirestore,
  deleteStudyNoteFromFirestore,
  saveQuestionHistoryBatchToFirestore,
  loadUserQuestionHistoryFromFirestore,
  User,
} from './firebase';
import {
  safeFetchJson,
  validateQuizAttemptPayload,
} from './utils/apiClient';

const STORAGE_KEYS = {
  PREFS: 'eduquiz_prefs_v1',
  ATTEMPTS: 'eduquiz_attempts_v1',
  ACTIVE_ATTEMPT_ID: 'eduquiz_active_attempt_id_v1',
  FINGERPRINTS: 'eduquiz_fingerprints_v1',
  QUESTION_HISTORY: 'iqquiz_question_history_v2',
  CLIENT_UID: 'iqquiz_client_uid_v1',
  NOTES: 'eduquiz_notes_v1',
};

interface PendingLaunchInternal extends PendingQuizLaunch {
  difficulty: DifficultyLevel;
  questionType: QuestionTypeFilter;
  durationMinutes: QuizDuration;
  noteMcqs?: StudyNoteAnalysis['mcqs'];
}

export default function App() {
  // 1. Completely Independent Language & Class Settings (Sections 2, 3, 4, 5)
  // Default Interface Language = English ('en')
  // Default Quiz Language = English ('en')
  const [interfaceLanguage, setInterfaceLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFS) || '{}');
      return saved.interfaceLanguage === 'bn' || saved.interfaceLanguage === 'hi'
        ? saved.interfaceLanguage
        : 'en';
    } catch {
      return 'en';
    }
  });

  const [quizLanguage, setQuizLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFS) || '{}');
      return saved.quizLanguage === 'bn' || saved.quizLanguage === 'hi'
        ? saved.quizLanguage
        : 'en';
    } catch {
      return 'en';
    }
  });

  const [selectedClass, setSelectedClass] = useState<ClassLevel>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFS) || '{}');
      return [5, 6, 7, 8, 9, 10].includes(Number(saved.selectedClass))
        ? (Number(saved.selectedClass) as ClassLevel)
        : 8;
    } catch {
      return 8;
    }
  });

  // Independent Subject selection (Never changes when interfaceLanguage or quizLanguage changes!)
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('mathematics');

  // Quiz Configuration State (Section 6)
  const [selectedTopic, setSelectedTopic] = useState<string>('All Verified Chapters');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('mixed');
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15 | 20 | 30>(5);
  const [questionType, setQuestionType] = useState<QuestionTypeFilter>('mcq');
  const [durationMinutes, setDurationMinutes] = useState<QuizDuration>(10);
  const [quizMode, setQuizMode] = useState<QuizMode>('practice');

  // Navigation & Mobile Drawer
  const [activeNav, setActiveNav] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Firebase Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Quiz Attempts, Active Attempt, Question History & Study Notes
  const [attemptsHistory, setAttemptsHistory] = useState<QuizAttemptState[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [activeAttempt, setActiveAttempt] = useState<QuizAttemptState | null>(null);
  const [seenFingerprints, setSeenFingerprints] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FINGERPRINTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.QUESTION_HISTORY);
      const parsed: QuestionHistoryRecord[] = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [clientUid] = useState<string>(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.CLIENT_UID);
      if (existing && existing.trim()) return existing.trim();
      const generated = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(STORAGE_KEYS.CLIENT_UID, generated);
      return generated;
    } catch {
      return 'local_student';
    }
  });

  const [savedNotes, setSavedNotes] = useState<SavedStudyNote[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Mandatory Pre-Quiz Language Selection Modal State
  const [pendingLaunch, setPendingLaunch] = useState<PendingLaunchInternal | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizGenError, setQuizGenError] = useState<string | null>(null);
  const [settingsSavedBanner, setSettingsSavedBanner] = useState(false);

  const effectiveUserId = currentUser?.uid || clientUid;

  // Backfill questionHistory from any existing attemptsHistory on mount so all past questions are tracked
  useEffect(() => {
    if (attemptsHistory.length === 0) return;
    setQuestionHistory((prev) => {
      const map = new Map<string, QuestionHistoryRecord>();
      for (const item of prev) {
        if (item && item.fingerprint) map.set(item.fingerprint, item);
      }
      let added = false;
      for (const att of attemptsHistory) {
        for (const q of att.questions || []) {
          if (q && q.fingerprint && !map.has(q.fingerprint)) {
            added = true;
            map.set(q.fingerprint, {
              historyId: `${effectiveUserId}_${q.fingerprint}`,
              userId: effectiveUserId,
              classLevel: att.config.classLevel,
              subject: att.config.subject,
              topic: q.topic || att.config.topic || 'General',
              difficulty: q.difficulty || att.config.difficulty || 'mixed',
              language: att.config.quizLanguage,
              fingerprint: q.fingerprint,
              structuralHash: q.structuralHash || q.fingerprint,
              conceptKey: q.conceptKey || 'concept_general',
              questionText: q.questionText,
              options: q.options,
              createdAt: att.startedAt || new Date().toISOString(),
            });
          }
        }
      }
      return added ? Array.from(map.values()) : prev;
    });
  }, [attemptsHistory, effectiveUserId]);

  // Persist Preferences locally & sync to Firestore when signed in
  useEffect(() => {
    const prefs = {
      selectedClass,
      interfaceLanguage,
      quizLanguage,
    };
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
    if (currentUser) {
      syncUserProfileToFirestore(currentUser, prefs).catch(() => {});
    }
  }, [selectedClass, interfaceLanguage, quizLanguage, currentUser]);

  // Persist Attempts, Fingerprints, QuestionHistory, and Notes locally
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attemptsHistory));
  }, [attemptsHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FINGERPRINTS, JSON.stringify(seenFingerprints));
  }, [seenFingerprints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTION_HISTORY, JSON.stringify(questionHistory));
  }, [questionHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(savedNotes));
  }, [savedNotes]);

  // Firebase Auth listener — syncs profile AND persistent questionHistory from Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const remotePrefs = await loadUserProfileFromFirestore(user);
          if (remotePrefs) {
            setSelectedClass(remotePrefs.selectedClass);
            setInterfaceLanguage(remotePrefs.interfaceLanguage);
            setQuizLanguage(remotePrefs.quizLanguage);
          } else {
            await syncUserProfileToFirestore(user, {
              selectedClass,
              interfaceLanguage,
              quizLanguage,
            });
          }

          const remoteHistory = await loadUserQuestionHistoryFromFirestore(user);
          if (remoteHistory.length > 0) {
            setQuestionHistory((prev) => {
              const map = new Map<string, QuestionHistoryRecord>();
              for (const r of remoteHistory) {
                if (r.fingerprint) map.set(r.fingerprint, r);
              }
              for (const l of prev) {
                if (l.fingerprint && !map.has(l.fingerprint)) {
                  map.set(l.fingerprint, l);
                }
              }
              return Array.from(map.values());
            });
            setSeenFingerprints((prev) =>
              Array.from(
                new Set([...prev, ...remoteHistory.map((r) => r.fingerprint).filter(Boolean)])
              )
            );
          }
        } catch (err) {
          console.error('Profile/history sync warning:', err);
        }
      }
    });
    return () => unsub();
  }, []);

  // Recover unfinished or active quiz attempt across page refresh (Sections 9 & 10)
  useEffect(() => {
    const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ATTEMPT_ID);
    if (!savedActiveId) return;

    // Immediately restore from local history if present (works across Vercel serverless cold starts)
    const localMatch = attemptsHistory.find((a) => a.attemptId === savedActiveId);
    if (localMatch) {
      setActiveAttempt(localMatch);
    }

    safeFetchJson<QuizAttemptState>(`/api/quiz/attempt/${savedActiveId}`)
      .then((recovered) => {
        const validated = validateQuizAttemptPayload(recovered);
        setActiveAttempt(validated);
        setAttemptsHistory((prev) => {
          const exists = prev.some((a) => a.attemptId === validated.attemptId);
          return exists
            ? prev.map((a) => (a.attemptId === validated.attemptId ? validated : a))
            : [validated, ...prev];
        });
      })
      .catch(() => {
        // Keep localMatch if serverless instance restarted
      });
  }, []);

  // Reset topic to "All Verified Chapters" when class or subject changes if the topic isn't in that curriculum
  const currentCurriculum = useMemo(
    () => getClassSubjectCurriculum(selectedClass, selectedSubject),
    [selectedClass, selectedSubject]
  );

  useEffect(() => {
    const validTitles = currentCurriculum.chapters.map((c) => c.title.en);
    if (
      selectedTopic !== 'All Verified Chapters' &&
      !validTitles.includes(selectedTopic)
    ) {
      setSelectedTopic('All Verified Chapters');
    }
  }, [currentCurriculum, selectedTopic]);

  // Update helper for attemptsHistory & persistent questionHistory
  const upsertAttemptInHistory = (updated: QuizAttemptState) => {
    setActiveAttempt(updated);
    if (updated.status === 'in_progress') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ATTEMPT_ID, updated.attemptId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ATTEMPT_ID);
    }

    setAttemptsHistory((prev) => {
      const idx = prev.findIndex((a) => a.attemptId === updated.attemptId);
      if (idx === -1) return [updated, ...prev];
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });

    // Build QuestionHistoryRecord entries for every question in this attempt
    const newRecords: QuestionHistoryRecord[] = (updated.questions || [])
      .filter((q) => q && q.fingerprint && q.questionText)
      .map((q) => ({
        historyId: `${effectiveUserId}_${q.fingerprint}`,
        userId: effectiveUserId,
        classLevel: updated.config.classLevel,
        subject: updated.config.subject,
        topic: q.topic || updated.config.topic || 'General',
        difficulty: q.difficulty || updated.config.difficulty || 'mixed',
        language: updated.config.quizLanguage,
        fingerprint: q.fingerprint,
        structuralHash: q.structuralHash || q.fingerprint,
        conceptKey: q.conceptKey || 'concept_general',
        questionText: q.questionText,
        options: q.options,
        createdAt: updated.startedAt || new Date().toISOString(),
      }));

    const newFps = newRecords.map((r) => r.fingerprint);
    setSeenFingerprints((prev) => Array.from(new Set([...prev, ...newFps])));

    setQuestionHistory((prev) => {
      const map = new Map<string, QuestionHistoryRecord>();
      for (const item of prev) {
        if (item && item.fingerprint) map.set(item.fingerprint, item);
      }
      for (const rec of newRecords) {
        map.set(rec.fingerprint, rec);
      }
      return Array.from(map.values());
    });

    if (currentUser) {
      saveQuizAttemptToFirestore(currentUser, updated).catch(() => {});
      saveQuestionHistoryBatchToFirestore(currentUser, newRecords).catch(() => {});
    }
  };

  // Builds a prioritized exclusion history payload for a specific (classLevel, subject, topic, difficulty)
  const buildExcludedHistoryPayload = (
    targetClass: ClassLevel,
    targetSubject: SubjectId,
    targetTopic?: string
  ) => {
    const map = new Map<string, QuestionHistoryRecord>();
    for (const item of questionHistory) {
      if (
        item &&
        item.fingerprint &&
        item.classLevel === targetClass &&
        item.subject === targetSubject
      ) {
        map.set(item.fingerprint, item);
      }
    }
    for (const att of attemptsHistory) {
      if (att.config.classLevel === targetClass && att.config.subject === targetSubject) {
        for (const q of att.questions || []) {
          if (q && q.fingerprint && !map.has(q.fingerprint)) {
            map.set(q.fingerprint, {
              historyId: `${effectiveUserId}_${q.fingerprint}`,
              userId: effectiveUserId,
              classLevel: att.config.classLevel,
              subject: att.config.subject,
              topic: q.topic || att.config.topic || 'General',
              difficulty: q.difficulty || att.config.difficulty || 'mixed',
              language: att.config.quizLanguage,
              fingerprint: q.fingerprint,
              structuralHash: q.structuralHash || q.fingerprint,
              conceptKey: q.conceptKey || 'concept_general',
              questionText: q.questionText,
              options: q.options,
              createdAt: att.startedAt || new Date().toISOString(),
            });
          }
        }
      }
    }

    const allMatching = Array.from(map.values());
    // Prioritize same topic first, then most recent up to 60 items for optimal token efficiency
    const sorted = allMatching.sort((a, b) => {
      const aTopicMatch = targetTopic && a.topic === targetTopic ? 1 : 0;
      const bTopicMatch = targetTopic && b.topic === targetTopic ? 1 : 0;
      if (aTopicMatch !== bTopicMatch) return bTopicMatch - aTopicMatch;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    return sorted.slice(0, 60).map((item) => ({
      fingerprint: item.fingerprint,
      structuralHash: item.structuralHash,
      conceptKey: item.conceptKey,
      questionText: item.questionText,
      options: item.options,
      classLevel: item.classLevel,
      subject: item.subject,
      topic: item.topic,
      difficulty: item.difficulty,
    }));
  };

  // MANDATORY PRE-QUIZ LANGUAGE GATE:
  // Opens the Language Selection Modal before EVERY new quiz attempt, subject quiz, practice test, random quiz, or retake.
  const requestQuizWithLanguageModal = (
    overrideConfig?: Partial<QuizConfig>,
    kind: 'standard' | 'random' | 'retake' | 'notes' = 'standard',
    extra?: {
      originalAttemptId?: string;
      noteMcqs?: StudyNoteAnalysis['mcqs'];
    }
  ) => {
    setQuizGenError(null);
    setPendingLaunch({
      kind,
      classLevel: overrideConfig?.classLevel ?? selectedClass,
      subject: overrideConfig?.subject ?? selectedSubject,
      topic: overrideConfig?.topic ?? selectedTopic,
      difficulty: overrideConfig?.difficulty ?? difficulty,
      questionCount: overrideConfig?.questionCount ?? questionCount,
      questionType: overrideConfig?.questionType ?? questionType,
      durationMinutes: overrideConfig?.durationMinutes ?? durationMinutes,
      mode: overrideConfig?.mode ?? quizMode,
      originalAttemptId: extra?.originalAttemptId,
      noteMcqs: extra?.noteMcqs,
    });
  };

  // Trigger a Random Quiz for the currently selected class (opens Language Selection Modal first!)
  const handleRequestRandomQuiz = () => {
    const randomSub =
      SUBJECT_LIST[Math.floor(Math.random() * SUBJECT_LIST.length)].id;
    setSelectedSubject(randomSub);
    requestQuizWithLanguageModal(
      {
        classLevel: selectedClass,
        subject: randomSub,
        topic: 'All Verified Chapters',
        difficulty: 'mixed',
        questionCount: 5,
        questionType: 'mixed',
        durationMinutes: 10,
        mode: 'practice',
      },
      'random'
    );
  };

  // Execute Quiz Generation ONLY after the student explicitly selects a language & clicks Continue in the modal
  const handleConfirmLanguageAndGenerate = async (
    confirmedQuizLanguage: LanguageCode
  ) => {
    if (!pendingLaunch) return;

    // Update the quizLanguage setting while keeping selectedClass, selectedSubject, and interfaceLanguage unchanged
    setQuizLanguage(confirmedQuizLanguage);
    setQuizGenError(null);
    setGeneratingQuiz(true);

    try {
      const excludedHistoryForTarget = buildExcludedHistoryPayload(
        pendingLaunch.classLevel,
        pendingLaunch.subject,
        pendingLaunch.topic
      );
      const allFingerprints = Array.from(
        new Set([
          ...seenFingerprints,
          ...questionHistory.map((h) => h.fingerprint).filter(Boolean),
        ])
      );

      if (pendingLaunch.kind === 'retake' && pendingLaunch.originalAttemptId) {
        const origAttempt =
          attemptsHistory.find((a) => a.attemptId === pendingLaunch.originalAttemptId) ||
          (activeAttempt?.attemptId === pendingLaunch.originalAttemptId ? activeAttempt : null);

        const rawData = await safeFetchJson('/api/quiz/retake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalAttemptId: pendingLaunch.originalAttemptId,
            originalConfig: origAttempt?.config || {
              classLevel: pendingLaunch.classLevel,
              subject: pendingLaunch.subject,
              quizLanguage: confirmedQuizLanguage,
              topic: pendingLaunch.topic,
              difficulty: pendingLaunch.difficulty,
              questionCount: pendingLaunch.questionCount,
              questionType: pendingLaunch.questionType,
              durationMinutes: pendingLaunch.durationMinutes,
              mode: pendingLaunch.mode,
            },
            originalQuestions: origAttempt?.questions || [],
            serverStateToken: origAttempt?.serverStateToken,
            quizLanguage: confirmedQuizLanguage,
            userId: effectiveUserId,
            clientExcludedFingerprints: allFingerprints,
            clientExcludedHistory: excludedHistoryForTarget,
          }),
        });
        const validated = validateQuizAttemptPayload(rawData);
        upsertAttemptInHistory(validated);
        setPendingLaunch(null);
        setActiveNav('take_quiz');
        return;
      }

      if (
        pendingLaunch.kind === 'notes' &&
        pendingLaunch.noteMcqs &&
        pendingLaunch.noteMcqs.length > 0 &&
        confirmedQuizLanguage === quizLanguage
      ) {
        const rawData = await safeFetchJson('/api/quiz/from-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mcqs: pendingLaunch.noteMcqs,
            classLevel: pendingLaunch.classLevel,
            subject: pendingLaunch.subject,
            quizLanguage: confirmedQuizLanguage,
            topic: pendingLaunch.topic,
            userId: effectiveUserId,
          }),
        });
        const validated = validateQuizAttemptPayload(rawData);
        upsertAttemptInHistory(validated);
        setPendingLaunch(null);
        setActiveNav('take_quiz');
        return;
      }

      // Standard / Random / Cross-language Note Quiz Generation in confirmedQuizLanguage
      const rawData = await safeFetchJson('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classLevel: pendingLaunch.classLevel,
          subject: pendingLaunch.subject,
          quizLanguage: confirmedQuizLanguage,
          topic: pendingLaunch.topic,
          difficulty: pendingLaunch.difficulty,
          questionCount: pendingLaunch.questionCount,
          questionType: pendingLaunch.questionType,
          durationMinutes: pendingLaunch.durationMinutes,
          mode: pendingLaunch.mode,
          userId: effectiveUserId,
          clientExcludedFingerprints: allFingerprints,
          clientExcludedHistory: excludedHistoryForTarget,
        }),
      });
      const validated = validateQuizAttemptPayload(rawData);
      upsertAttemptInHistory(validated);
      setPendingLaunch(null);
      setActiveNav('take_quiz');
    } catch (err: any) {
      // Keep pendingLaunch open so student can retry without losing class, subject, or language selection
      setQuizGenError(err?.message || t(interfaceLanguage, 'genErrorTitle'));
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Strict Irreversible Answer Locking Handler
  const handleLockAnswer = async (
    questionId: string,
    selectedIndex: number,
    elapsedSeconds: number
  ) => {
    if (!activeAttempt) return;
    const data = await safeFetchJson<{ locked?: boolean; attempt?: QuizAttemptState }>(
      '/api/quiz/lock-answer',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: activeAttempt.attemptId,
          questionId,
          selectedIndex,
          timeTakenSeconds: elapsedSeconds,
          serverStateToken: activeAttempt.serverStateToken,
          lockedAnswersSnapshot: activeAttempt.lockedAnswers,
        }),
      }
    );
    if (data?.attempt) {
      upsertAttemptInHistory(validateQuizAttemptPayload(data.attempt));
    }
  };

  // Toggle Mark for Review (Unanswered questions only)
  const handleToggleReview = async (questionId: string) => {
    if (!activeAttempt) return;
    const data = await safeFetchJson<{ attempt?: QuizAttemptState }>(
      '/api/quiz/toggle-review',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: activeAttempt.attemptId,
          questionId,
          serverStateToken: activeAttempt.serverStateToken,
          lockedAnswersSnapshot: activeAttempt.lockedAnswers,
          markedForReviewSnapshot: activeAttempt.markedForReview,
        }),
      }
    );
    if (data?.attempt) {
      upsertAttemptInHistory(validateQuizAttemptPayload(data.attempt));
    }
  };

  // Submit Final Quiz Attempt
  const handleSubmitQuiz = async (elapsedSeconds: number) => {
    if (!activeAttempt) return;
    const data = await safeFetchJson<QuizAttemptState>('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId: activeAttempt.attemptId,
        timeTakenSeconds: elapsedSeconds,
        serverStateToken: activeAttempt.serverStateToken,
        lockedAnswersSnapshot: activeAttempt.lockedAnswers,
      }),
    });
    const validated = validateQuizAttemptPayload(data);
    upsertAttemptInHistory(validated);
  };

  // Retake Quiz — Opens the Mandatory Language Selection Modal FIRST, preserving original attempt
  const handleRetakeQuiz = async (originalAttemptId: string) => {
    const orig =
      attemptsHistory.find((a) => a.attemptId === originalAttemptId) || activeAttempt;
    requestQuizWithLanguageModal(
      {
        classLevel: orig?.config.classLevel ?? selectedClass,
        subject: orig?.config.subject ?? selectedSubject,
        topic: orig?.config.topic ?? 'All Verified Chapters',
        difficulty: (orig?.config.difficulty as DifficultyLevel) ?? 'mixed',
        questionCount: (orig?.questions.length as any) ?? 5,
        questionType: (orig?.config.questionType as QuestionTypeFilter) ?? 'mcq',
        durationMinutes: (orig?.config.durationMinutes as QuizDuration) ?? 10,
        mode: orig?.config.mode ?? 'practice',
      },
      'retake',
      { originalAttemptId }
    );
  };

  // Launch interactive locked quiz from Study Notes MCQs — Opens Language Selection Modal FIRST
  const handleLaunchQuizFromNoteMcqs = async (
    mcqs: StudyNoteAnalysis['mcqs'],
    cls: ClassLevel,
    sub: SubjectId,
    qLang: LanguageCode,
    topicName: string
  ) => {
    setQuizLanguage(qLang);
    requestQuizWithLanguageModal(
      {
        classLevel: cls,
        subject: sub,
        topic: topicName,
        difficulty: 'mixed',
        questionCount: (mcqs.length as any) || 5,
        questionType: 'mcq',
        durationMinutes: 10,
        mode: 'practice',
      },
      'notes',
      { noteMcqs: mcqs }
    );
  };

  // Real User Analytics Calculated Strictly from Actual Completed Attempts (Section 14)
  const completedAttempts = useMemo(
    () => attemptsHistory.filter((a) => a.status === 'completed'),
    [attemptsHistory]
  );

  const averageScorePercentage = useMemo(() => {
    if (completedAttempts.length === 0) return 0;
    const sum = completedAttempts.reduce(
      (acc, a) => acc + (a.scoreSummary?.percentage ?? 0),
      0
    );
    return Math.round(sum / completedAttempts.length);
  }, [completedAttempts]);

  const subjectWiseStats = useMemo(() => {
    return SUBJECT_LIST.map((sub) => {
      const subAttempts = completedAttempts.filter((a) => a.config.subject === sub.id);
      const totalQ = subAttempts.reduce(
        (acc, a) => acc + (a.scoreSummary?.totalQuestions ?? a.questions.length),
        0
      );
      const totalCorrect = subAttempts.reduce(
        (acc, a) => acc + (a.scoreSummary?.correctCount ?? 0),
        0
      );
      const avgPct =
        subAttempts.length > 0
          ? Math.round(
              subAttempts.reduce((acc, a) => acc + (a.scoreSummary?.percentage ?? 0), 0) /
                subAttempts.length
            )
          : null;

      return {
        subjectId: sub.id,
        name: sub.name[interfaceLanguage],
        attemptsCount: subAttempts.length,
        totalQuestions: totalQ,
        totalCorrect,
        averageAccuracy: avgPct,
      };
    });
  }, [completedAttempts, interfaceLanguage]);

  const weakTopicsList = useMemo(() => {
    const map = new Map<
      string,
      {
        topic: string;
        subject: SubjectId;
        classLevel: ClassLevel;
        total: number;
        correct: number;
      }
    >();

    for (const att of completedAttempts) {
      const breakdown = att.scoreSummary?.topicBreakdown || [];
      for (const tb of breakdown) {
        const key = `${att.config.subject}__${tb.topic}`;
        const existing = map.get(key) || {
          topic: tb.topic,
          subject: att.config.subject,
          classLevel: att.config.classLevel,
          total: 0,
          correct: 0,
        };
        existing.total += tb.total;
        existing.correct += tb.correct;
        map.set(key, existing);
      }
    }

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        accuracy: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0,
      }))
      .filter((item) => item.accuracy < 75)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
  }, [completedAttempts]);

  const getCurriculumBadgeLabel = (
    status: 'prescribed' | 'integrated_evs' | 'language_elective' | 'additional_practice'
  ) => {
    switch (status) {
      case 'prescribed':
        return t(interfaceLanguage, 'statusPrescribed');
      case 'integrated_evs':
        return t(interfaceLanguage, 'statusIntegratedEvs');
      case 'language_elective':
        return t(interfaceLanguage, 'statusLanguageElective');
      default:
        return t(interfaceLanguage, 'statusAdditionalPractice');
    }
  };

  const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: t(interfaceLanguage, 'navDashboard'),
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'take_quiz',
      label: t(interfaceLanguage, 'navTakeQuiz'),
      icon: <PlayCircle className="w-4 h-4" />,
    },
    {
      id: 'practice_tests',
      label: t(interfaceLanguage, 'navPracticeTests'),
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      id: 'study_notes',
      label: t(interfaceLanguage, 'navStudyNotes'),
      icon: <BookOpenText className="w-4 h-4" />,
    },
    {
      id: 'my_results',
      label: t(interfaceLanguage, 'navMyResults'),
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: 'progress',
      label: t(interfaceLanguage, 'navProgress'),
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: t(interfaceLanguage, 'navSettings'),
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // Keep browser tab title synchronized with IQ Quiz branding and active section
  useEffect(() => {
    const activeLabel = navItems.find((n) => n.id === activeNav)?.label;
    document.title = activeLabel
      ? `IQ Quiz — ${activeLabel}`
      : `IQ Quiz — ${t(interfaceLanguage, 'tagline')}`;
  }, [activeNav, interfaceLanguage]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900">
        {/* Mandatory Pre-Quiz Language Selection Modal */}
        <QuizLanguageModal
          pendingLaunch={pendingLaunch}
          interfaceLanguage={interfaceLanguage}
          isGenerating={generatingQuiz}
          errorMessage={quizGenError}
          onConfirmLanguageAndStart={handleConfirmLanguageAndGenerate}
          onClose={() => {
            if (!generatingQuiz) {
              setPendingLaunch(null);
              setQuizGenError(null);
            }
          }}
        />

        {/* Desktop Sidebar Navigation (260px) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#0F172A] text-white border-r border-slate-800 z-30">
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs tracking-tight shrink-0 shadow-xs">
              IQ
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold tracking-tight text-white truncate flex items-center gap-1.5">
                <span>{t(interfaceLanguage, 'brandName')}</span>
                <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {t(interfaceLanguage, 'tagline')}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveNav(item.id)}
                  className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap overflow-hidden ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-active-pill"
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-indigo-600 rounded-lg"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {item.id === 'take_quiz' &&
                    activeAttempt &&
                    activeAttempt.status === 'in_progress' && (
                      <span className="relative z-10 text-[10px] font-mono bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">
                        LIVE
                      </span>
                    )}
                </motion.button>
              );
            })}
          </nav>

          {/* Independent Quick Context Summary in Sidebar Footer */}
          <div className="p-4 m-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>{t(interfaceLanguage, 'classLabel')}:</span>
              <span className="font-bold text-white tabular-nums">
                Class {selectedClass}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>{t(interfaceLanguage, 'interfaceLangLabel')}:</span>
              <span className="font-semibold text-slate-200">
                {LANGUAGE_LABELS[interfaceLanguage]}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              {currentUser ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-400 truncate">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOutUser()}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    title={t(interfaceLanguage, 'signOut')}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    setAuthError(null);
                    try {
                      await signInWithGoogle();
                    } catch (e: any) {
                      setAuthError(e?.message || 'Sign-in cancelled');
                    }
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t(interfaceLanguage, 'signInGoogle')}</span>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Drawer Overlay with Smooth Opening & Closing Animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <motion.div
                key="mobile-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                key="mobile-drawer-panel"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-64 max-w-xs bg-[#0F172A] text-white h-full flex flex-col z-10 shadow-2xl"
              >
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs tracking-tight shrink-0">
                      IQ
                    </span>
                    <span className="font-bold text-base">
                      {t(interfaceLanguage, 'brandName')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    aria-label="Close navigation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                  {navItems.map((item, idx) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.025 }}
                      onClick={() => {
                        setActiveNav(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                        activeNav === item.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Top Bar (Clean 3-Zone Contract: Context Breadcrumb — Independent Selectors — Primary CTA) */}
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            {/* Zone 1: Mobile Menu Trigger & Brand / Active Section Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 whitespace-nowrap shrink-0">
                <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-[11px] font-extrabold flex items-center justify-center tracking-tight shrink-0">
                  IQ
                </span>
                <span>{t(interfaceLanguage, 'brandName')}</span>
                <span className="text-slate-300 font-normal">/</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeNav}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
                    className="text-indigo-700 inline-block"
                  >
                    {navItems.find((n) => n.id === activeNav)?.label}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

          {/* Zone 2: Independent Class, Interface Language, and Quiz Language Controls */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            {/* Class Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium whitespace-nowrap">
                {t(interfaceLanguage, 'classLabel')}:
              </span>
              <select
                aria-label="Select Class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value) as ClassLevel)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-900 cursor-pointer"
              >
                {CLASS_LEVELS.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Independent Interface Language Selector */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-500 font-medium whitespace-nowrap">
                {t(interfaceLanguage, 'interfaceLangLabel')}:
              </span>
              <select
                aria-label="Interface Language"
                value={interfaceLanguage}
                onChange={(e) => setInterfaceLanguage(e.target.value as LanguageCode)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-900 cursor-pointer"
              >
                {(['en', 'bn', 'hi'] as LanguageCode[]).map((l) => (
                  <option key={l} value={l}>
                    {LANGUAGE_LABELS[l]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Zone 3: Single Primary Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => requestQuizWithLanguageModal()}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t(interfaceLanguage, 'navTakeQuiz')}
            </button>
          </div>
        </header>

        {/* Mobile Quick Bar for Independent Language & Class Switching */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <select
            aria-label="Mobile Select Class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(Number(e.target.value) as ClassLevel)}
            className="px-2 py-1 rounded border border-slate-200 bg-slate-50 font-semibold"
          >
            {CLASS_LEVELS.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className="text-slate-500">{t(interfaceLanguage, 'interfaceLangLabel')}:</label>
            <select
              value={interfaceLanguage}
              onChange={(e) => setInterfaceLanguage(e.target.value as LanguageCode)}
              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 font-semibold"
            >
              {(['en', 'bn', 'hi'] as LanguageCode[]).map((l) => (
                <option key={l} value={l}>
                  {LANGUAGE_LABELS[l]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Viewport Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          <AnimatePresence>
            {authError && (
              <motion.div
                key="auth-error-banner"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between"
              >
                <span>{authError}</span>
                <button
                  type="button"
                  onClick={() => setAuthError(null)}
                  className="underline ml-4 cursor-pointer"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* =========================================================
                VIEW 1: DASHBOARD (Section 1, 5, 14)
               ========================================================= */}
            {activeNav === 'dashboard' && (
              <motion.div
                key="view-dashboard"
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
              {/* Hero Welcome Banner & Independence Verification Strip */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="text-xs font-semibold text-indigo-600">
                      {t(interfaceLanguage, 'tagline')}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      {t(interfaceLanguage, 'welcomeHeading')}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {t(interfaceLanguage, 'welcomeSub')}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => requestQuizWithLanguageModal()}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{t(interfaceLanguage, 'startQuizBtn')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRequestRandomQuiz}
                        className="px-5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <Shuffle className="w-4 h-4 text-indigo-600" />
                        <span>{t(interfaceLanguage, 'randomQuizBtn')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Class Selector Matrix */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 shrink-0">
                    <div className="text-xs font-semibold text-slate-600">
                      {t(interfaceLanguage, 'selectClassPrompt')}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {CLASS_LEVELS.map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setSelectedClass(cls)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold tabular-nums transition-colors cursor-pointer whitespace-nowrap ${
                            selectedClass === cls
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          Class {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real User KPI Metrics Strip (Zero Fabricated Statistics) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-xs text-slate-500">
                      {t(interfaceLanguage, 'statCurrentClass')}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                      Class {selectedClass}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      UI: {LANGUAGE_LABELS[interfaceLanguage]}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-xs text-slate-500">
                      {t(interfaceLanguage, 'statQuizzesCompleted')}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                      {completedAttempts.length}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Verified server-locked attempts
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-xs text-slate-500">
                      {t(interfaceLanguage, 'statAverageScore')}
                    </div>
                    <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-1">
                      {completedAttempts.length > 0 ? `${averageScorePercentage}%` : '—'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      From permanently locked answers
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-xs text-slate-500">
                      {t(interfaceLanguage, 'statUniqueQuestionsSeen')}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                      {seenFingerprints.length}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Excluded from repeat quizzes
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Unfinished Quiz Banner (if student has an in-progress quiz) */}
              {activeAttempt && activeAttempt.status === 'in_progress' && (
                <div className="bg-indigo-950 text-white rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">
                      Unfinished Quiz In Progress
                    </div>
                    <div className="text-base font-bold">
                      Class {activeAttempt.config.classLevel} ·{' '}
                      {getSubjectDefinition(activeAttempt.config.subject).name[interfaceLanguage]}{' '}
                      ({LANGUAGE_LABELS[activeAttempt.config.quizLanguage]})
                    </div>
                    <div className="text-xs text-indigo-200">
                      {Object.keys(activeAttempt.lockedAnswers).length} of{' '}
                      {activeAttempt.questions.length} answers permanently locked.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav('take_quiz')}
                    className="px-4 py-2.5 rounded-lg bg-white text-slate-900 font-semibold text-xs flex items-center gap-2 hover:bg-indigo-50 cursor-pointer"
                  >
                    <span>Resume Locked Attempt</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Seven Independent Academic Subject Cards (Section 5) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {t(interfaceLanguage, 'subjectExplorerTitle')} (Class {selectedClass})
                    </h2>
                    <p className="text-sm text-slate-600">
                      {t(interfaceLanguage, 'subjectExplorerSub')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {SUBJECT_LIST.map((sub) => {
                    const curr = sub.curriculumByClass[selectedClass];
                    const stats = subjectWiseStats.find((s) => s.subjectId === sub.id);

                    return (
                      <div
                        key={sub.id}
                        className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors edu-card-hover"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Class {selectedClass}</span>
                            <span>·</span>
                            <span
                              className={
                                curr.status === 'prescribed'
                                  ? 'text-emerald-700 font-medium'
                                  : 'text-amber-700 font-medium'
                              }
                            >
                              {getCurriculumBadgeLabel(curr.status)}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900">
                            {sub.name[interfaceLanguage]}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {sub.shortDesc[interfaceLanguage]}
                          </p>

                          <div className="pt-1 text-[11px] text-slate-500">
                            {curr.boardNote[interfaceLanguage]}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                            <span>
                              Attempts: <strong>{stats?.attemptsCount || 0}</strong>
                            </span>
                            <span>
                              Avg Score:{' '}
                              <strong>
                                {stats?.averageAccuracy !== null &&
                                stats?.averageAccuracy !== undefined
                                  ? `${stats.averageAccuracy}%`
                                  : '—'}
                              </strong>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubject(sub.id);
                                setSelectedTopic('All Verified Chapters');
                                if (activeAttempt?.status === 'in_progress') {
                                  setActiveAttempt(null);
                                }
                                setActiveNav('take_quiz');
                              }}
                              className="py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer whitespace-nowrap"
                            >
                              {t(interfaceLanguage, 'startSubjectQuiz')}
                            </button>

                            <button
                              type="button"
                              disabled={generatingQuiz}
                              onClick={() => {
                                setSelectedSubject(sub.id);
                                requestQuizWithLanguageModal({
                                  classLevel: selectedClass,
                                  subject: sub.id,
                                  topic: 'All Verified Chapters',
                                  questionCount: 5,
                                  mode: 'practice',
                                });
                              }}
                              className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white cursor-pointer whitespace-nowrap disabled:opacity-50"
                            >
                              {t(interfaceLanguage, 'quickPracticeBtn')}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Attempts & Weak Topics Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Attempts */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      {t(interfaceLanguage, 'recentAttemptsTitle')}
                    </h3>
                    {completedAttempts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveNav('my_results')}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        View All ({completedAttempts.length})
                      </button>
                    )}
                  </div>

                  {completedAttempts.length === 0 ? (
                    <div className="py-8 text-center space-y-3">
                      <p className="text-sm text-slate-500">
                        {t(interfaceLanguage, 'noAttemptsYet')}
                      </p>
                      <button
                        type="button"
                        onClick={() => requestQuizWithLanguageModal()}
                        className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                      >
                        {t(interfaceLanguage, 'startQuizBtn')}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {completedAttempts.slice(0, 5).map((att) => {
                        const subDef = getSubjectDefinition(att.config.subject);
                        const pct = att.scoreSummary?.percentage ?? 0;
                        return (
                          <div
                            key={att.attemptId}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                Class {att.config.classLevel} ·{' '}
                                {subDef.name[interfaceLanguage]} — {att.config.topic}
                              </div>
                              <div className="text-xs text-slate-500">
                                Quiz Language: {LANGUAGE_LABELS[att.config.quizLanguage]} ·{' '}
                                {att.config.mode.toUpperCase()} ·{' '}
                                {new Date(att.completedAt || att.startedAt).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
                                {att.scoreSummary?.score ?? 0}/
                                {att.scoreSummary?.maxScore ?? att.questions.length} ({pct}%)
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveAttempt(att);
                                  setActiveNav('take_quiz');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Weak Topics & Suggested Revision */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    {t(interfaceLanguage, 'weakTopicsTitle')}
                  </h3>
                  {weakTopicsList.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6">
                      {t(interfaceLanguage, 'weakTopicsEmpty')}
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {weakTopicsList.map((wt, i) => {
                        const subDef = getSubjectDefinition(wt.subject);
                        return (
                          <div
                            key={i}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {wt.topic}
                              </div>
                              <div className="text-xs text-slate-500 tabular-nums">
                                Class {wt.classLevel} · {subDef.name[interfaceLanguage]} ·
                                Accuracy: <strong className="text-red-600">{wt.accuracy}%</strong>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                requestQuizWithLanguageModal({
                                  classLevel: wt.classLevel,
                                  subject: wt.subject,
                                  topic: wt.topic,
                                  questionCount: 5,
                                  mode: 'practice',
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold shrink-0 cursor-pointer"
                            >
                              {t(interfaceLanguage, 'practiceNow')}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              </motion.div>
            )}

            {/* =========================================================
                VIEW 2: TAKE A QUIZ (Quiz Config / Active Quiz / Official Results)
               ========================================================= */}
            {activeNav === 'take_quiz' && (
              <motion.div
                key={`view-take-quiz-${activeAttempt ? `${activeAttempt.attemptId}-${activeAttempt.status}` : 'config'}`}
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
              {activeAttempt && activeAttempt.status === 'in_progress' ? (
                <ActiveQuizView
                  attempt={activeAttempt}
                  interfaceLanguage={interfaceLanguage}
                  onLockAnswer={handleLockAnswer}
                  onToggleReview={handleToggleReview}
                  onSubmitQuiz={handleSubmitQuiz}
                />
              ) : activeAttempt && activeAttempt.status === 'completed' ? (
                <ResultsView
                  attempt={activeAttempt}
                  interfaceLanguage={interfaceLanguage}
                  onRetakeQuiz={handleRetakeQuiz}
                  onGenerateNewQuiz={() =>
                    requestQuizWithLanguageModal({
                      classLevel: activeAttempt.config.classLevel,
                      subject: activeAttempt.config.subject,
                      topic: activeAttempt.config.topic,
                      difficulty: (activeAttempt.config.difficulty as DifficultyLevel) || 'mixed',
                      questionCount: (activeAttempt.questions.length as any) || 5,
                      questionType:
                        (activeAttempt.config.questionType as QuestionTypeFilter) || 'mcq',
                      durationMinutes:
                        (activeAttempt.config.durationMinutes as QuizDuration) ?? 10,
                      mode: activeAttempt.config.mode,
                    })
                  }
                />
              ) : (
                /* Full 9-Parameter Quiz Configuration Screen (Section 6) */
                <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="space-y-1.5">
                      <h1 className="text-2xl font-bold text-slate-900">
                        {t(interfaceLanguage, 'quizSetupTitle')}
                      </h1>
                      <p className="text-sm text-slate-600">
                        {t(interfaceLanguage, 'quizSetupSubtitle')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRequestRandomQuiz}
                      className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Shuffle className="w-4 h-4 text-indigo-600" />
                      <span>{t(interfaceLanguage, 'randomQuizBtn')}</span>
                    </button>
                  </div>

                  {/* Independence Reminder Note */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-4">
                    <span>{t(interfaceLanguage, 'independenceNote')}</span>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0 tabular-nums">
                      Excluded History: {seenFingerprints.length} Qs
                    </span>
                  </div>

                  {/* 1. Class Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {t(interfaceLanguage, 'selectClassPrompt')}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {CLASS_LEVELS.map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setSelectedClass(cls)}
                          className={`py-2.5 px-3 rounded-lg border text-sm font-bold tabular-nums transition-colors cursor-pointer ${
                            selectedClass === cls
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          Class {cls}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Independent Subject Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {t(interfaceLanguage, 'selectSubjectPrompt')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {SUBJECT_LIST.map((sub) => {
                        const isSelected = selectedSubject === sub.id;
                        const subCurr = sub.curriculumByClass[selectedClass];
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSelectedSubject(sub.id)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="font-bold text-sm text-slate-900">
                              {sub.name[interfaceLanguage]}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {getCurriculumBadgeLabel(subCurr.status)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500 pt-1">
                      {currentCurriculum.boardNote[interfaceLanguage]}
                    </p>
                  </div>

                  {/* 3. Quiz Language Notice (Selected in the 3-Language Screen upon clicking Start Quiz) */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center gap-3 text-xs text-indigo-950">
                    <Languages className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      <strong>{t(interfaceLanguage, 'quizLangLabel')}:</strong>{' '}
                      {t(interfaceLanguage, 'langModalSubtitle')} (🇬🇧 English · বাংলা · हिन्दी)
                    </span>
                  </div>

                  {/* 4. Chapter / Topic Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {t(interfaceLanguage, 'selectTopicPrompt')}
                    </label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 font-medium"
                    >
                      <option value="All Verified Chapters">
                        {t(interfaceLanguage, 'allChaptersOption')}
                      </option>
                      {currentCurriculum.chapters.map((ch) => (
                        <option key={ch.id} value={ch.title.en}>
                          {ch.title[interfaceLanguage]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5, 6, 7, 8: Difficulty, Question Count, Question Type, Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Difficulty */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        {t(interfaceLanguage, 'selectDifficultyPrompt')}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {(
                          [
                            ['easy', t(interfaceLanguage, 'diffEasy')],
                            ['medium', t(interfaceLanguage, 'diffMedium')],
                            ['hard', t(interfaceLanguage, 'diffHard')],
                            ['mixed', t(interfaceLanguage, 'diffMixed')],
                          ] as [DifficultyLevel, string][]
                        ).map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDifficulty(val)}
                            className={`py-2 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                              difficulty === val
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Questions */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        {t(interfaceLanguage, 'selectCountPrompt')}
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {([5, 10, 15, 20, 30] as const).map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setQuestionCount(cnt)}
                            className={`py-2 px-2 rounded-lg border text-xs font-bold tabular-nums cursor-pointer ${
                              questionCount === cnt
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            {cnt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Type */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        {t(interfaceLanguage, 'selectTypePrompt')}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            ['mcq', 'MCQ'],
                            ['tf', 'True/False'],
                            ['mixed', 'Mixed'],
                          ] as [QuestionTypeFilter, string][]
                        ).map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setQuestionType(val)}
                            className={`py-2 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                              questionType === val
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        {t(interfaceLanguage, 'selectDurationPrompt')}
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(
                          [
                            [0, t(interfaceLanguage, 'durUntimed')],
                            [10, '10m'],
                            [20, '20m'],
                            [30, '30m'],
                          ] as [QuizDuration, string][]
                        ).map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDurationMinutes(val)}
                            className={`py-2 px-2 rounded-lg border text-xs font-semibold tabular-nums cursor-pointer ${
                              durationMinutes === val
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 9. Assessment Mode (Practice vs Test Mode) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {t(interfaceLanguage, 'selectModePrompt')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setQuizMode('practice')}
                        className={`p-4 rounded-xl border text-left space-y-1 cursor-pointer ${
                          quizMode === 'practice'
                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-sm text-slate-900">
                          {t(interfaceLanguage, 'modePractice')}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {t(interfaceLanguage, 'modePracticeDesc')}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuizMode('test')}
                        className={`p-4 rounded-xl border text-left space-y-1 cursor-pointer ${
                          quizMode === 'test'
                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-sm text-slate-900">
                          {t(interfaceLanguage, 'modeTest')}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {t(interfaceLanguage, 'modeTestDesc')}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Strict Answer Locking Notice */}
                  <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs text-amber-950">
                      <div className="font-bold">
                        {t(interfaceLanguage, 'strictLockWarningTitle')}
                      </div>
                      <p className="leading-relaxed">
                        {t(interfaceLanguage, 'strictLockWarningBody')}
                      </p>
                    </div>
                  </div>

                  {/* Start Quiz & Generate New Quiz Action Buttons — Both open Language Selection Modal first */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={generatingQuiz}
                      onClick={() => requestQuizWithLanguageModal()}
                      className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${generatingQuiz ? 'animate-spin' : ''}`}
                      />
                      {t(interfaceLanguage, 'generateNewQuizBtn')}
                    </button>

                    <button
                      type="button"
                      disabled={generatingQuiz}
                      onClick={() => requestQuizWithLanguageModal()}
                      className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      {generatingQuiz
                        ? t(interfaceLanguage, 'generatingQuizMsg')
                        : t(interfaceLanguage, 'startQuizBtn')}
                    </button>
                  </div>
                </div>
              )}
              </motion.div>
            )}

            {/* =========================================================
                VIEW 3: PRACTICE TESTS (Curated Board & Exam Packs)
               ========================================================= */}
            {activeNav === 'practice_tests' && (
              <motion.div
                key="view-practice-tests"
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {t(interfaceLanguage, 'practiceTestsTitle')} (Class {selectedClass})
                    </h1>
                    <p className="text-sm text-slate-600">
                      {t(interfaceLanguage, 'practiceTestsSub')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestRandomQuiz}
                    className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Shuffle className="w-4 h-4 text-indigo-600" />
                    <span>{t(interfaceLanguage, 'randomQuizBtn')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {SUBJECT_LIST.map((sub) => {
                    const curr = sub.curriculumByClass[selectedClass];
                    return (
                      <div
                        key={sub.id}
                        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between edu-card-hover"
                      >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Class {selectedClass}</span>
                          <span>·</span>
                          <span>{getCurriculumBadgeLabel(curr.status)}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {sub.name[interfaceLanguage]} — Complete Syllabus Mock Pack
                        </h3>
                        <p className="text-xs text-slate-600">
                          {curr.boardNote[interfaceLanguage]}
                        </p>

                        <div className="pt-2 space-y-1">
                          <div className="text-xs font-semibold text-slate-700">
                            Included Chapters:
                          </div>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {curr.chapters.map((ch) => (
                              <li key={ch.id} className="truncate">
                                • {ch.title[interfaceLanguage]}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          disabled={generatingQuiz}
                          onClick={() =>
                            requestQuizWithLanguageModal({
                              classLevel: selectedClass,
                              subject: sub.id,
                              topic: 'All Verified Chapters',
                              difficulty: 'mixed',
                              questionCount: 10,
                              questionType: 'mixed',
                              durationMinutes: 10,
                              mode: 'test',
                            })
                          }
                          className="flex-1 py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer text-center"
                        >
                          {t(interfaceLanguage, 'launchTestModeBtn')} (10 Q · 10m)
                        </button>

                        <button
                          type="button"
                          disabled={generatingQuiz}
                          onClick={() =>
                            requestQuizWithLanguageModal({
                              classLevel: selectedClass,
                              subject: sub.id,
                              topic: 'All Verified Chapters',
                              difficulty: 'mixed',
                              questionCount: 5,
                              questionType: 'mcq',
                              durationMinutes: 0,
                              mode: 'practice',
                            })
                          }
                          className="flex-1 py-2.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold cursor-pointer text-center"
                        >
                          {t(interfaceLanguage, 'launchPracticeModeBtn')} (5 Q)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              </motion.div>
            )}

            {/* =========================================================
                VIEW 4: STUDY NOTES & AI TOOLS (Section 13)
               ========================================================= */}
            {activeNav === 'study_notes' && (
              <motion.div
                key="view-study-notes"
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <StudyNotesView
                  interfaceLanguage={interfaceLanguage}
                  defaultClass={selectedClass}
                  defaultQuizLanguage={quizLanguage}
                  userId={effectiveUserId}
                  savedNotes={savedNotes}
                  onSaveNote={async (note) => {
                    setSavedNotes((prev) => [note, ...prev]);
                    if (currentUser) {
                      await saveStudyNoteToFirestore(currentUser, note);
                    }
                  }}
                  onDeleteNote={async (noteId) => {
                    setSavedNotes((prev) => prev.filter((n) => n.noteId !== noteId));
                    if (currentUser) {
                      await deleteStudyNoteFromFirestore(currentUser, noteId);
                    }
                  }}
                  onLaunchQuizFromNoteMcqs={handleLaunchQuizFromNoteMcqs}
                />
              </motion.div>
            )}

            {/* =========================================================
                VIEW 5: MY RESULTS (All Attempts History & Retakes)
               ========================================================= */}
            {activeNav === 'my_results' && (
              <motion.div
                key="view-my-results"
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-900">
                  {t(interfaceLanguage, 'navMyResults')}
                </h1>
                <p className="text-sm text-slate-600">
                  Every completed quiz is permanently preserved. Retaking a quiz opens the language selection screen and starts a separate new attempt without altering your past results.
                </p>
              </div>

              {attemptsHistory.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
                  <p className="text-sm text-slate-500">
                    {t(interfaceLanguage, 'noAttemptsYet')}
                  </p>
                  <button
                    type="button"
                    onClick={() => requestQuizWithLanguageModal()}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    {t(interfaceLanguage, 'startQuizBtn')}
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Class & Subject</th>
                          <th className="py-3 px-4">Quiz Language</th>
                          <th className="py-3 px-4">Mode</th>
                          <th className="py-3 px-4 text-right">Locked / Total</th>
                          <th className="py-3 px-4 text-right">Score</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {attemptsHistory.map((att) => {
                          const subDef = getSubjectDefinition(att.config.subject);
                          const lockedCnt = Object.keys(att.lockedAnswers).length;
                          const isCompleted = att.status === 'completed';

                          return (
                            <tr key={att.attemptId} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                                <div>
                                  {new Date(att.completedAt || att.startedAt).toLocaleDateString()}
                                </div>
                                {att.parentAttemptId && (
                                  <div className="text-[11px] font-medium text-indigo-600">
                                    Retake Session
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900">
                                  Class {att.config.classLevel} ·{' '}
                                  {subDef.name[interfaceLanguage]}
                                </div>
                                <div className="text-xs text-slate-500 truncate max-w-xs">
                                  {att.config.topic}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-xs font-semibold text-indigo-700">
                                {LANGUAGE_LABELS[att.config.quizLanguage]}
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-600">
                                {att.config.mode.toUpperCase()}
                              </td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums text-xs">
                                {lockedCnt}/{att.questions.length}
                              </td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                                {isCompleted ? (
                                  <span className="text-slate-900">
                                    {att.scoreSummary?.score ?? 0}/
                                    {att.scoreSummary?.maxScore ?? att.questions.length} (
                                    {att.scoreSummary?.percentage ?? 0}%)
                                  </span>
                                ) : (
                                  <span className="text-amber-700 text-xs">
                                    In Progress
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveAttempt(att);
                                      setActiveNav('take_quiz');
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                                  >
                                    {isCompleted ? 'Read-Only Review' : 'Resume'}
                                  </button>
                                  {isCompleted && (
                                    <button
                                      type="button"
                                      onClick={() => handleRetakeQuiz(att.attemptId)}
                                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      Retake
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              </motion.div>
            )}

            {/* =========================================================
                VIEW 6: PROGRESS & OPTIONAL PREMIUM FEATURES (Sections 14 & 17)
               ========================================================= */}
            {activeNav === 'progress' && (
              <motion.div
                key="view-progress"
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-900">
                  {t(interfaceLanguage, 'progressTitle')}
                </h1>
                <p className="text-sm text-slate-600">
                  {t(interfaceLanguage, 'progressSub')}
                </p>
              </div>

              {/* Subject-Wise Performance Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-slate-900">
                    {t(interfaceLanguage, 'subjectPerformanceTitle')}
                  </h2>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 tabular-nums">
                      {t(interfaceLanguage, 'questionHistoryCountLabel')}:{' '}
                      <strong className="text-slate-900">{seenFingerprints.length}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        setSeenFingerprints([]);
                        await fetch('/api/quiz/reset-history', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: effectiveUserId }),
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
                    >
                      {t(interfaceLanguage, 'clearHistoryBtn')}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4 text-right">Completed Quizzes</th>
                        <th className="py-3 px-4 text-right">Locked Correct</th>
                        <th className="py-3 px-4 text-right">Total Questions</th>
                        <th className="py-3 px-4 text-right">Average Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {subjectWiseStats.map((st) => (
                        <tr key={st.subjectId} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {st.name}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                            {st.attemptsCount}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                            {st.totalCorrect}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                            {st.totalQuestions}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                            {st.averageAccuracy !== null ? `${st.averageAccuracy}%` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Optional Educator & Institutional Plans (Section 17 — Honest, Configurable, Never Fakes Payment) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900">
                    {t(interfaceLanguage, 'premiumSectionTitle')}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {t(interfaceLanguage, 'premiumSectionSub')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-xl border border-emerald-600 bg-emerald-50/30 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-emerald-800">
                        For Individual Students (Active Plan)
                      </div>
                      <div className="text-xl font-bold text-slate-900 font-mono">
                        Free Tier
                      </div>
                      <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                        <li>• Classes 5–10 & All 7 Independent Subjects</li>
                        <li>• English, বাংলা & हिन्दी Quiz Languages</li>
                        <li>• Strict Answer Locking & Read-Only Review</li>
                        <li>• AI Study Notes, Flashcards & Summaries</li>
                      </ul>
                    </div>
                    <div className="pt-3 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Active on Your Account
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700">
                        For High-Volume Exam Prep
                      </div>
                      <div className="text-xl font-bold text-slate-900 font-mono">
                        Scholar Pack · Optional
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                        <li>• Bulk 100-Question Full Madhyamik Mock Papers</li>
                        <li>• Exportable PDF Question Banks & Answer Keys</li>
                        <li>• Extended Multi-Year Performance Archiving</li>
                      </ul>
                    </div>
                    <div className="pt-3 text-[11px] text-slate-500">
                      Requires verified payment gateway configuration. Not unlocked without verified billing.
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700">
                        For Schools & Coaching Institutes
                      </div>
                      <div className="text-xl font-bold text-slate-900 font-mono">
                        Teacher Dashboard · Optional
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                        <li>• Cohort-wide Class 5–10 Assessment Reports</li>
                        <li>• Custom Scheduled Proctored Test Windows</li>
                        <li>• Batch Student Roster & Analytics Export</li>
                      </ul>
                    </div>
                    <div className="pt-3 text-[11px] text-slate-500">
                      Requires verified institutional subscription.
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            )}

            {/* =========================================================
                VIEW 7: SETTINGS (Independent Language & Class Preferences)
               ========================================================= */}
            {activeNav === 'settings' && (
              <motion.div
                key="view-settings"
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6"
              >
              <div className="border-b border-slate-200 pb-4 space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  {t(interfaceLanguage, 'settingsTitle')}
                </h1>
                <p className="text-sm text-slate-600">
                  {t(interfaceLanguage, 'settingsSub')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950">
                {t(interfaceLanguage, 'independenceNote')}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    {t(interfaceLanguage, 'interfaceLangLabel')} (Website UI Only)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['en', 'bn', 'hi'] as LanguageCode[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setInterfaceLanguage(lang)}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold cursor-pointer ${
                          interfaceLanguage === lang
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400'
                        }`}
                      >
                        {LANGUAGE_LABELS[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">
                    {t(interfaceLanguage, 'quizLangLabel')} (🇬🇧 English · বাংলা · हिन्दी)
                  </div>
                  <p>
                    {t(interfaceLanguage, 'langModalSubtitle')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Default {t(interfaceLanguage, 'classLabel')} (Classes 5–10)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {CLASS_LEVELS.map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`py-2.5 px-3 rounded-lg border text-sm font-bold tabular-nums cursor-pointer ${
                          selectedClass === cls
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        Class {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                {settingsSavedBanner ? (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {t(interfaceLanguage, 'settingsSavedMsg')}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">
                    Automatically persisted to browser storage & Firestore when signed in.
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSettingsSavedBanner(true);
                    setTimeout(() => setSettingsSavedBanner(false), 3000);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  {t(interfaceLanguage, 'saveSettingsBtn')}
                </button>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
    </MotionConfig>
  );
}
