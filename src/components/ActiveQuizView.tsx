import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Lock,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Send,
  ShieldAlert,
} from 'lucide-react';
import {
  LanguageCode,
  QuizAttemptState,
  doesModeHideAnswersUntilCompleted,
  normalizeQuizMode,
} from '../types';
import { t, LANGUAGE_LABELS } from '../i18n/translations';
import { getSubjectDefinition, formatTopicForDisplay } from '../data/curriculum';
import {
  getOrInitAttemptTimer,
  computeTimerSnapshot,
} from '../utils/quizTimer';

interface ActiveQuizViewProps {
  attempt: QuizAttemptState;
  interfaceLanguage: LanguageCode;
  onLockAnswer: (questionId: string, selectedIndex: number, elapsedSeconds: number) => Promise<void>;
  onToggleReview: (questionId: string) => Promise<void>;
  onSubmitQuiz: (elapsedSeconds: number) => Promise<void>;
}

export const ActiveQuizView: React.FC<ActiveQuizViewProps> = ({
  attempt,
  interfaceLanguage: _interfaceLanguage,
  onLockAnswer,
  onToggleReview,
  onSubmitQuiz,
}) => {
  // CRITICAL: Every question, option, instruction, hint, feedback message,
  // and explanation inside the quiz must be presented in the selected quizLanguage.
  const quizLang: LanguageCode = attempt.config.quizLanguage;

  const [currentIndex, setCurrentIndex] = useState(0);
  // Draft option selection BEFORE the student confirms & locks the answer
  const [draftSelections, setDraftSelections] = useState<Record<string, number>>({});
  const [lockingQuestionId, setLockingQuestionId] = useState<string | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [lockError, setLockError] = useState<string | null>(null);

  // Keep a live ref to onSubmitQuiz so auto-submission on timer expiry ALWAYS uses the latest attempt state
  const onSubmitQuizRef = useRef(onSubmitQuiz);
  useEffect(() => {
    onSubmitQuizRef.current = onSubmitQuiz;
  }, [onSubmitQuiz]);

  const hasAutoSubmittedRef = useRef<string | null>(null);

  // Initialize or restore persistent start/end timestamps for this attempt
  const timerRecord = useMemo(
    () => getOrInitAttemptTimer(attempt),
    [attempt.attemptId, attempt.config.durationMinutes, attempt.config.mode]
  );

  const normalizedMode = normalizeQuizMode(attempt.config.mode);
  const totalAllowedSeconds = timerRecord.totalAllowedSeconds;
  const isTimedQuiz = normalizedMode !== 'practice' && totalAllowedSeconds > 0;
  const hideAnswersUntilComplete = doesModeHideAnswersUntilCompleted(attempt.config.mode);
  const allowStudyHints = normalizedMode === 'practice' || normalizedMode === 'timed';

  const [timerState, setTimerState] = useState(() =>
    computeTimerSnapshot(timerRecord, Date.now())
  );

  const elapsedSeconds = timerState.elapsedSeconds;
  const remainingSeconds = timerState.remainingSeconds;

  // Warning states:
  // - Yellow warning when 1 minute (60s) or less remains (> 10s)
  // - Red warning when 10 seconds or less remain
  const isRedWarning = isTimedQuiz && remainingSeconds <= 10;
  const isYellowWarning = isTimedQuiz && remainingSeconds <= 60 && remainingSeconds > 10;

  // Timestamp-driven countdown loop (immune to tab throttling, refresh, or accidental navigation)
  useEffect(() => {
    if (attempt.status === 'completed') return;

    const syncFromTimestamp = () => {
      const snap = computeTimerSnapshot(timerRecord, Date.now());
      setTimerState((prev) => {
        if (
          prev.remainingSeconds === snap.remainingSeconds &&
          prev.elapsedSeconds === snap.elapsedSeconds &&
          prev.isExpired === snap.isExpired
        ) {
          return prev;
        }
        return snap;
      });

      if (
        isTimedQuiz &&
        snap.isExpired &&
        hasAutoSubmittedRef.current !== attempt.attemptId
      ) {
        hasAutoSubmittedRef.current = attempt.attemptId;
        setShowSubmitModal(false);
        setSubmittingQuiz(true);
        Promise.resolve(onSubmitQuizRef.current(totalAllowedSeconds)).finally(() => {
          setSubmittingQuiz(false);
        });
      }
    };

    // Run immediately so an already-expired attempt on refresh submits right away
    syncFromTimestamp();

    const intervalId = window.setInterval(syncFromTimestamp, 250);
    const handleVisibilityOrFocus = () => {
      syncFromTimestamp();
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('pageshow', handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('pageshow', handleVisibilityOrFocus);
    };
  }, [attempt.attemptId, attempt.status, isTimedQuiz, timerRecord, totalAllowedSeconds]);

  // Warn against accidental browser tab closure during an active timed quiz
  useEffect(() => {
    if (attempt.status === 'completed' || !isTimedQuiz) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [attempt.status, isTimedQuiz]);

  const questions = attempt.questions;
  const currentQuestion = questions[currentIndex] || questions[0];
  if (!currentQuestion) return null;

  const lockedRecord = attempt.lockedAnswers[currentQuestion.id];
  const isLocked = Boolean(lockedRecord);
  const isMarkedForReview = attempt.markedForReview.includes(currentQuestion.id);
  const selectedOptionIndex = isLocked
    ? lockedRecord.selectedIndex
    : draftSelections[currentQuestion.id];

  const subjectDef = getSubjectDefinition(attempt.config.subject);
  const lockedCount = Object.keys(attempt.lockedAnswers).length;
  const unansweredCount = questions.length - lockedCount;

  const formatTime = (secs: number) => {
    const safeSecs = Math.max(0, Math.floor(secs));
    const mins = Math.floor(safeSecs / 60);
    const rem = safeSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const progressPct = isTimedQuiz
    ? Math.max(0, Math.min(100, (remainingSeconds / totalAllowedSeconds) * 100))
    : 100;

  const handleSelectOption = (optionIdx: number) => {
    setLockError(null);
    // CRITICAL: If this question is already locked or quiz is auto-submitting, forbid any interaction!
    if (isLocked || lockingQuestionId === currentQuestion.id || submittingQuiz) {
      setLockError(t(quizLang, 'answerLockedBadge'));
      return;
    }
    setDraftSelections((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIdx,
    }));
  };

  const handleConfirmLock = async () => {
    if (isLocked || submittingQuiz) return;
    const chosen = draftSelections[currentQuestion.id];
    if (typeof chosen !== 'number') return;

    setLockError(null);
    setLockingQuestionId(currentQuestion.id);
    try {
      await onLockAnswer(currentQuestion.id, chosen, elapsedSeconds);
    } catch (err: any) {
      setLockError(err?.message || 'Could not lock answer.');
    } finally {
      setLockingQuestionId(null);
    }
  };

  const handleFinalSubmit = async () => {
    if (submittingQuiz) return;
    hasAutoSubmittedRef.current = attempt.attemptId;
    setSubmittingQuiz(true);
    try {
      await onSubmitQuiz(elapsedSeconds);
    } finally {
      setSubmittingQuiz(false);
      setShowSubmitModal(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-6xl mx-auto space-y-5"
    >
      {/* Top Assessment & Sticky Countdown Timer Bar (Responsive on Mobile & Desktop) */}
      <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
              <span>
                {t(quizLang, 'classLabel')} {attempt.config.classLevel}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-800">
                {subjectDef.name[quizLang]}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t(quizLang, 'quizLangLabel')}:{' '}
                <strong className="text-indigo-700">
                  {LANGUAGE_LABELS[quizLang]}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                  normalizedMode === 'exam'
                    ? 'bg-slate-900 text-white'
                    : normalizedMode === 'challenge'
                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                    : normalizedMode === 'timed'
                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {normalizedMode === 'exam'
                  ? t(quizLang, 'examNoPauseBadge')
                  : normalizedMode === 'challenge'
                  ? t(quizLang, 'challengeModeBadge')
                  : normalizedMode === 'timed'
                  ? t(quizLang, 'timedModeBadge')
                  : t(quizLang, 'untimedLabel')}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 truncate">
              {formatTopicForDisplay(
                attempt.config.topic,
                attempt.config.subject,
                attempt.config.classLevel
              )}
            </h2>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0">
            {/* Countdown / Untimed Display */}
            <div
              role="timer"
              aria-live={isRedWarning ? 'assertive' : 'off'}
              aria-atomic="true"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border font-mono text-sm sm:text-base font-bold tabular-nums transition-colors ${
                isRedWarning
                  ? 'bg-red-100 border-red-500 text-red-800 ring-2 ring-red-500/30 animate-pulse'
                  : isYellowWarning
                  ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-400/30'
                  : isTimedQuiz
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              }`}
            >
              <Clock
                className={`w-4 h-4 shrink-0 ${
                  isRedWarning
                    ? 'text-red-700'
                    : isYellowWarning
                    ? 'text-amber-700'
                    : isTimedQuiz
                    ? 'text-slate-600'
                    : 'text-emerald-700'
                }`}
              />
              {isTimedQuiz ? (
                <span>
                  {t(quizLang, 'timeRemaining')}: {formatTime(remainingSeconds)}
                </span>
              ) : (
                <span>
                  {t(quizLang, 'untimedLabel')} · {formatTime(elapsedSeconds)}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={submittingQuiz}
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t(quizLang, 'finishAndSubmitTestBtn')}</span>
            </button>
          </div>
        </div>

        {/* Visual Countdown Progress Strip */}
        {isTimedQuiz && (
          <div className="w-full h-1.5 bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isRedWarning
                  ? 'bg-red-600'
                  : isYellowWarning
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Yellow (<= 1 min) & Red (<= 10 sec) Warning Banner */}
        <AnimatePresence>
          {(isYellowWarning || isRedWarning || submittingQuiz) && (
            <motion.div
              key={
                submittingQuiz
                  ? 'auto-submitting'
                  : isRedWarning
                  ? 'red-warning'
                  : 'yellow-warning'
              }
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className={`px-4 py-2 text-xs font-semibold flex items-center justify-between gap-2 border-t ${
                isRedWarning || submittingQuiz
                  ? 'bg-red-600 text-white border-red-700'
                  : 'bg-amber-100 text-amber-950 border-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {submittingQuiz && remainingSeconds <= 0
                    ? t(quizLang, 'autoSubmittingMsg')
                    : isRedWarning
                    ? t(quizLang, 'timerWarningRed')
                    : t(quizLang, 'timerWarningYellow')}
                </span>
              </div>
              {isTimedQuiz && (
                <span className="font-mono font-bold tabular-nums shrink-0">
                  {formatTime(remainingSeconds)}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Two-Column Quiz Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Card & Strict Answer Locking */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* Question Header & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {t(quizLang, 'questionProgress')} {currentIndex + 1}{' '}
                    {t(quizLang, 'ofTotal')} {questions.length}
                  </span>
                  <span className="text-xs text-slate-500">
                    · {currentQuestion.difficulty.toUpperCase()} ·{' '}
                    {currentQuestion.questionType === 'tf'
                      ? t(quizLang, 'typeTf')
                      : t(quizLang, 'typeMcq')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-md">
                      <Lock className="w-3.5 h-3.5 text-slate-700" />
                      {t(quizLang, 'answerLockedBadge')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleReview(currentQuestion.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isMarkedForReview
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      {isMarkedForReview
                        ? t(quizLang, 'unmarkReview')
                        : t(quizLang, 'markForReview')}
                    </button>
                  )}
                </div>
              </div>

              {/* Question Stem (Rendered in selected Quiz Language) */}
              <div className="space-y-3">
                <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                  {currentQuestion.questionText}
                </p>
                {currentQuestion.hint && !isLocked && allowStudyHints && (
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setShowHint((prev) => ({
                          ...prev,
                          [currentQuestion.id]: !prev[currentQuestion.id],
                        }))
                      }
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {showHint[currentQuestion.id]
                        ? t(quizLang, 'hideHintBtn')
                        : t(quizLang, 'showHintBtn')}
                    </button>
                    <AnimatePresence>
                      {showHint[currentQuestion.id] && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.16 }}
                          className="mt-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-hidden"
                        >
                          {currentQuestion.hint}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Options List */}
              <div className="space-y-3" role="radiogroup" aria-label="Answer Options">
                {currentQuestion.options.map((optionText, idx) => {
                  const optionLetter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOptionIndex === idx;

                  // Determine visual state when locked:
                  // In Practice, Timed, and Challenge modes, show immediate answer feedback if available.
                  // In Exam Mode, hide correct answers until the quiz is completed.
                  const showPracticeFeedback =
                    isLocked &&
                    !hideAnswersUntilComplete &&
                    typeof lockedRecord?.correctIndex === 'number';
                  const isCorrectOption =
                    showPracticeFeedback && lockedRecord.correctIndex === idx;
                  const isWrongLockedSelection =
                    showPracticeFeedback && isSelected && !lockedRecord.isCorrect;

                  let borderAndBg =
                    'border-slate-200 bg-white hover:border-slate-300 text-slate-800';
                  if (isLocked) {
                    if (showPracticeFeedback) {
                      if (isCorrectOption) {
                        borderAndBg = 'border-emerald-600 bg-emerald-50/70 text-emerald-950';
                      } else if (isWrongLockedSelection) {
                        borderAndBg = 'border-red-600 bg-red-50/70 text-red-950';
                      } else {
                        borderAndBg = 'border-slate-200 bg-slate-50 text-slate-400 opacity-75';
                      }
                    } else {
                      // Exam Mode locked state (correct answer remains hidden until quiz completion!)
                      if (isSelected) {
                        borderAndBg = 'border-slate-900 bg-slate-100 text-slate-900';
                      } else {
                        borderAndBg = 'border-slate-200 bg-slate-50 text-slate-400 opacity-75';
                      }
                    }
                  } else if (isSelected) {
                    borderAndBg =
                      'border-indigo-600 bg-indigo-50/50 text-slate-900 ring-1 ring-indigo-600';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isLocked || lockingQuestionId === currentQuestion.id || submittingQuiz}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${borderAndBg} ${
                        isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 tabular-nums ${
                            isSelected
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <span className="text-sm sm:text-base font-medium leading-snug">
                          {optionText}
                        </span>
                      </div>

                      {/* Status Icon on Locked Options */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isLocked && showPracticeFeedback && isCorrectOption && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t(quizLang, 'correctAnswersLabel')}</span>
                          </span>
                        )}
                        {isLocked && showPracticeFeedback && isWrongLockedSelection && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                            <XCircle className="w-4 h-4" />
                            <span>{t(quizLang, 'incorrectAnswersLabel')}</span>
                          </span>
                        )}
                        {isLocked && !showPracticeFeedback && isSelected && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                            <Lock className="w-4 h-4" />
                            <span>{t(quizLang, 'paletteAnswered')}</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {lockError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{lockError}</span>
                </div>
              )}

              {/* Action Block: Pre-Lock Confirmation vs Post-Lock Permanent Status */}
              {!isLocked ? (
                <div className="pt-2 space-y-3">
                  <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>{t(quizLang, 'confirmLockNotice')}</span>
                  </div>

                  <button
                    type="button"
                    disabled={
                      typeof selectedOptionIndex !== 'number' ||
                      lockingQuestionId === currentQuestion.id ||
                      submittingQuiz
                    }
                    onClick={handleConfirmLock}
                    className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    {lockingQuestionId === currentQuestion.id
                      ? '...'
                      : t(quizLang, 'submitAndLockBtn')}
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2 space-y-4"
                >
                  {/* Locked Status Banner */}
                  {!hideAnswersUntilComplete && typeof lockedRecord.correctIndex === 'number' ? (
                    <div
                      className={`p-4 rounded-xl border ${
                        lockedRecord.isCorrect
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-red-50/70 border-red-200 text-red-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          {lockedRecord.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-700 shrink-0" />
                          )}
                          <span>
                            {lockedRecord.isCorrect
                              ? t(quizLang, 'lockedCorrectBadge')
                              : t(quizLang, 'lockedIncorrectBadge')}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-500 tabular-nums">
                          {new Date(lockedRecord.lockedAt).toLocaleTimeString()}
                        </span>
                      </div>

                      {typeof lockedRecord.correctIndex === 'number' && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 text-sm space-y-1.5">
                          <p className="font-semibold">
                            {t(quizLang, 'correctAnswerLabel')}{' '}
                            <span className="text-emerald-800">
                              ({String.fromCharCode(65 + lockedRecord.correctIndex)}){' '}
                              {currentQuestion.options[lockedRecord.correctIndex]}
                            </span>
                          </p>
                          {lockedRecord.explanation && (
                            <p className="text-slate-700 leading-relaxed">
                              <strong className="text-slate-900">
                                {t(quizLang, 'explanationHeading')}:
                              </strong>{' '}
                              {lockedRecord.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-sm font-semibold">
                        <Lock className="w-4 h-4 text-slate-700 shrink-0" />
                        <span>{t(quizLang, 'lockedTestModeBadge')}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        ({String.fromCharCode(65 + lockedRecord.selectedIndex)})
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Previous / Next Navigation Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => {
                setLockError(null);
                setCurrentIndex((i) => Math.max(0, i - 1));
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-sm font-medium text-slate-800 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              {t(quizLang, 'prevQuestionBtn')}
            </button>

            <span className="text-xs text-slate-500 tabular-nums">
              {lockedCount} {t(quizLang, 'paletteAnswered')} · {unansweredCount}{' '}
              {t(quizLang, 'paletteUnanswered')}
            </span>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setLockError(null);
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm font-medium text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                {t(quizLang, 'nextQuestionBtn')}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-4 h-4" />
                {t(quizLang, 'finishAndSubmitTestBtn')}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Palette & Attempt Security Info */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {t(quizLang, 'questionPaletteTitle')}
              </h3>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {lockedCount}/{questions.length}
              </span>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const qLocked = attempt.lockedAnswers[q.id];
                const qReview = attempt.markedForReview.includes(q.id);
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                if (qLocked) {
                  if (!hideAnswersUntilComplete && typeof qLocked.isCorrect === 'boolean') {
                    btnClass = qLocked.isCorrect
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-red-600 border-red-600 text-white';
                  } else {
                    btnClass = 'bg-slate-900 border-slate-900 text-white';
                  }
                } else if (qReview) {
                  btnClass = 'bg-amber-100 border-amber-400 text-amber-900';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setLockError(null);
                      setCurrentIndex(idx);
                    }}
                    className={`h-10 rounded-lg border text-xs font-bold tabular-nums transition-all flex items-center justify-center gap-0.5 cursor-pointer ${btnClass} ${
                      isCurrent ? 'ring-2 ring-indigo-600 ring-offset-1' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {qLocked && <Lock className="w-2.5 h-2.5 opacity-80" />}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-900 inline-block" />
                <span>
                  {t(quizLang, 'paletteAnswered')} ({lockedCount})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-200 border border-amber-400 inline-block" />
                <span>
                  {t(quizLang, 'paletteReview')} ({attempt.markedForReview.length})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300 inline-block" />
                <span>
                  {t(quizLang, 'paletteUnanswered')} ({unansweredCount})
                </span>
              </div>
            </div>
          </div>

          {/* Attempt Integrity Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 text-xs text-slate-600">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t(quizLang, 'strictLockWarningTitle')}</span>
            </div>
            <p className="leading-relaxed">
              {t(quizLang, 'strictLockWarningBody')}
            </p>
          </div>
        </div>
      </div>

      {/* Final Submission Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            key="submit-quiz-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !submittingQuiz) {
                setShowSubmitModal(false);
              }
            }}
          >
            <motion.div
              key="submit-quiz-card"
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-900">
                {t(quizLang, 'confirmFinalSubmitTitle')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t(quizLang, 'confirmFinalSubmitBody')}
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1 tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-600">{t(quizLang, 'paletteAnswered')}:</span>
                  <span className="font-bold text-slate-900">{lockedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {t(quizLang, 'paletteUnanswered')} (0):
                  </span>
                  <span className="font-bold text-amber-700">{unansweredCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {t(quizLang, 'confirmSubmitCancel')}
                </button>
                <button
                  type="button"
                  disabled={submittingQuiz}
                  onClick={handleFinalSubmit}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
                >
                  {submittingQuiz
                    ? '...'
                    : t(quizLang, 'confirmSubmitYes')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
