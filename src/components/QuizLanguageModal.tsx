import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Languages,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  X,
  Lock,
  BookOpen,
  Clock,
  ShieldCheck,
  Flame,
  SlidersHorizontal,
  GraduationCap,
} from 'lucide-react';
import {
  ClassLevel,
  LanguageCode,
  QuizMode,
  SelectableQuizMode,
  SubjectId,
  getTimerMinutesForQuestionCount,
  normalizeQuizMode,
} from '../types';
import { t } from '../i18n/translations';
import {
  ClassSubjectCurriculum,
  getSubjectDefinition,
  getSubjectsForClass,
} from '../data/curriculum';

export interface PendingQuizLaunch {
  kind: 'standard' | 'random' | 'retake' | 'notes';
  classLevel: ClassLevel;
  subject: SubjectId;
  topic: string;
  questionCount: number;
  durationMinutes?: number;
  mode: QuizMode;
  originalAttemptId?: string;
  skipSubjectStep?: boolean;
}

type QuizStartStep = 'mode' | 'language' | 'subject';

interface QuizLanguageModalProps {
  pendingLaunch: PendingQuizLaunch | null;
  interfaceLanguage: LanguageCode;
  defaultQuizLanguage?: LanguageCode;
  isGenerating: boolean;
  errorMessage: string | null;
  onConfirmLanguageAndStart: (
    selectedQuizLanguage: LanguageCode,
    selectedQuizMode: SelectableQuizMode,
    selectedSubject: SubjectId
  ) => Promise<void>;
  onClose: () => void;
}

const LANGUAGE_CARD_OPTIONS: {
  code: LanguageCode;
  title: string;
  randomFlowTitle: string;
  nativeSubtitle: string;
  descKey: string;
}[] = [
  {
    code: 'en',
    title: '🇬🇧 English',
    randomFlowTitle: 'English',
    nativeSubtitle: 'English Medium Quiz',
    descKey: 'langCardEnDesc',
  },
  {
    code: 'bn',
    title: 'বাংলা',
    randomFlowTitle: 'বাংলা (Bengali)',
    nativeSubtitle: 'বাংলা মাধ্যমে কুইজ',
    descKey: 'langCardBnDesc',
  },
  {
    code: 'hi',
    title: 'हिन्दी',
    randomFlowTitle: 'हिन्दी (Hindi)',
    nativeSubtitle: 'हिन्दी माध्यम में क्विज़',
    descKey: 'langCardHiDesc',
  },
];

function getCurriculumStatusBadgeLabel(
  status: ClassSubjectCurriculum['status'],
  interfaceLanguage: LanguageCode
): string {
  if (status === 'prescribed') return t(interfaceLanguage, 'curriculumBadgePrescribed');
  if (status === 'integrated_evs') return t(interfaceLanguage, 'curriculumBadgeIntegrated');
  if (status === 'language_elective') return t(interfaceLanguage, 'curriculumBadgeElective');
  return t(interfaceLanguage, 'curriculumBadgeAdditional');
}

export const QuizLanguageModal: React.FC<QuizLanguageModalProps> = ({
  pendingLaunch,
  interfaceLanguage,
  defaultQuizLanguage = 'en',
  isGenerating,
  errorMessage,
  onConfirmLanguageAndStart,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<QuizStartStep>('mode');
  const [selectedMode, setSelectedMode] = useState<SelectableQuizMode>('practice');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(defaultQuizLanguage);
  const [wizardSubject, setWizardSubject] = useState<SubjectId>('mathematics');
  const inFlightSubmitRef = useRef<boolean>(false);

  const isRandomQuizFlow = pendingLaunch?.kind === 'random';
  const isSubjectLocked = Boolean(pendingLaunch?.skipSubjectStep);
  const effectiveSubject: SubjectId =
    (isSubjectLocked || isRandomQuizFlow) && pendingLaunch
      ? pendingLaunch.subject
      : wizardSubject;

  // Reset modal step when a new pendingLaunch session opens.
  // For Random Quiz, open directly on the Language selection screen.
  // Keep the wizard's subject selection independent from the dashboard's subject selection.
  useEffect(() => {
    if (pendingLaunch) {
      const classSubjects = getSubjectsForClass(pendingLaunch.classLevel);
      setCurrentStep(pendingLaunch.kind === 'random' ? 'language' : 'mode');
      setSelectedMode(normalizeQuizMode(pendingLaunch.mode));
      setSelectedLang(defaultQuizLanguage || interfaceLanguage || 'en');
      if (!pendingLaunch.skipSubjectStep && pendingLaunch.kind !== 'random') {
        setWizardSubject((prev) =>
          classSubjects.some((s) => s.id === prev)
            ? prev
            : classSubjects[0]?.id || 'mathematics'
        );
      }
      inFlightSubmitRef.current = false;
    } else {
      inFlightSubmitRef.current = false;
    }
  }, [pendingLaunch]);

  // Keep inFlightSubmitRef synced when generation finishes or errors
  useEffect(() => {
    if (!isGenerating) {
      inFlightSubmitRef.current = false;
    }
  }, [isGenerating]);

  const availableSubjects = pendingLaunch
    ? getSubjectsForClass(pendingLaunch.classLevel)
    : [];

  const activeSubjectDef = pendingLaunch
    ? availableSubjects.find((s) => s.id === effectiveSubject) ||
      getSubjectDefinition(effectiveSubject)
    : null;

  const activeSubjectCurriculum =
    pendingLaunch && activeSubjectDef
      ? activeSubjectDef.curriculumByClass[pendingLaunch.classLevel]
      : null;

  const timerMinutes = pendingLaunch
    ? getTimerMinutesForQuestionCount(pendingLaunch.questionCount)
    : 3;

  const modeOptions: {
    id: SelectableQuizMode;
    title: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'practice',
      title: t(interfaceLanguage, 'modePractice'),
      description: t(interfaceLanguage, 'modePracticeDesc'),
      badge: t(interfaceLanguage, 'durUntimed'),
      icon: <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
    {
      id: 'timed',
      title: t(interfaceLanguage, 'modeTimed'),
      description: t(interfaceLanguage, 'modeTimedDesc'),
      badge: `${timerMinutes} min Timer`,
      icon: <Clock className="w-4 h-4 text-indigo-600 shrink-0" />,
    },
    {
      id: 'exam',
      title: t(interfaceLanguage, 'modeExam'),
      description: t(interfaceLanguage, 'modeExamDesc'),
      badge: `${timerMinutes} min · Hidden Answers`,
      icon: <ShieldCheck className="w-4 h-4 text-slate-800 shrink-0" />,
    },
    {
      id: 'challenge',
      title: t(interfaceLanguage, 'modeChallenge'),
      description: t(interfaceLanguage, 'modeChallengeDesc'),
      badge: `Hard · ${timerMinutes} min Timer`,
      icon: <Flame className="w-4 h-4 text-amber-600 shrink-0" />,
    },
  ];

  const activeModeObj =
    modeOptions.find((m) => m.id === selectedMode) || modeOptions[0];

  const activeLanguageObj =
    LANGUAGE_CARD_OPTIONS.find((l) => l.code === selectedLang) ||
    LANGUAGE_CARD_OPTIONS[0];

  const handleContinueToLanguageStep = () => {
    if (!selectedMode || isGenerating) return;
    setCurrentStep('language');
  };

  const handleBackToModeStep = () => {
    if (isGenerating) return;
    setCurrentStep('mode');
  };

  const handleContinueToSubjectStep = () => {
    if (!selectedLang || isGenerating || isSubjectLocked || isRandomQuizFlow) return;
    setCurrentStep('subject');
  };

  const handleBackToLanguageStep = () => {
    if (isGenerating) return;
    setCurrentStep('language');
  };

  // Random Quiz immediate start upon selecting a language
  const handleSelectRandomQuizLanguage = async (langCode: LanguageCode) => {
    if (!pendingLaunch || isGenerating || inFlightSubmitRef.current) return;
    setSelectedLang(langCode);
    inFlightSubmitRef.current = true;
    try {
      await onConfirmLanguageAndStart(
        langCode,
        normalizeQuizMode(pendingLaunch.mode),
        pendingLaunch.subject
      );
    } finally {
      inFlightSubmitRef.current = false;
    }
  };

  const handleConfirmStartQuiz = async () => {
    const canConfirm = isSubjectLocked
      ? currentStep === 'language'
      : currentStep === 'subject';
    if (
      !canConfirm ||
      !selectedLang ||
      !selectedMode ||
      !effectiveSubject ||
      isGenerating ||
      inFlightSubmitRef.current
    ) {
      return;
    }
    inFlightSubmitRef.current = true;
    try {
      await onConfirmLanguageAndStart(selectedLang, selectedMode, effectiveSubject);
    } finally {
      inFlightSubmitRef.current = false;
    }
  };

  return (
    <AnimatePresence>
      {(isGenerating || (pendingLaunch && activeSubjectDef)) && (
        <motion.div
          key="quiz-lang-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={`fixed inset-0 w-screen h-dvh bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none ${
            isGenerating
              ? 'z-[9999] overflow-hidden touch-none overscroll-none cursor-wait'
              : 'z-50 overflow-y-auto'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={isGenerating ? undefined : 'quiz-language-modal-title'}
          aria-label={isGenerating ? 'Generating quiz, please wait...' : undefined}
          onClick={(e) => {
            if (isGenerating) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          onTouchMove={(e) => {
            if (isGenerating) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onWheel={(e) => {
            if (isGenerating) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="quiz-loading-minimal-card"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white border border-slate-200 rounded-2xl max-w-md w-full px-6 py-10 sm:px-8 sm:py-12 shadow-xl flex items-center justify-center text-center my-auto pointer-events-auto"
                aria-live="assertive"
                aria-busy="true"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm sm:text-base font-medium text-slate-700 tracking-tight">
                  Generating quiz, please wait...
                </p>
              </motion.div>
            ) : pendingLaunch && activeSubjectDef ? (
              <motion.div
                key="quiz-lang-modal-card"
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-xl space-y-5 my-auto max-h-[92dvh] overflow-y-auto"
              >
                {isRandomQuizFlow ? (
                  /* =========================================================
                     RANDOM QUIZ DIRECT LANGUAGE SELECTION FLOW
                     (No Mode Selection, No Subject Selection, No Extra Confirmation)
                     ========================================================= */
                  <>
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                            {t(interfaceLanguage, 'randomQuizBtn')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-900">
                            {t(interfaceLanguage, 'classLabel')} {pendingLaunch.classLevel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{pendingLaunch.questionCount} Questions</span>
                        </div>

                        <h2
                          id="quiz-language-modal-title"
                          className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2"
                        >
                          <Languages className="w-5 h-5 text-indigo-600 shrink-0" />
                          <span>Select Quiz Language</span>
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {t(interfaceLanguage, 'randomQuizSub')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        aria-label={t(interfaceLanguage, 'langModalCancelBtn')}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch"
                        role="radiogroup"
                        aria-label="Select Quiz Language"
                      >
                        {LANGUAGE_CARD_OPTIONS.map((option) => {
                          const isSelected = selectedLang === option.code;
                          return (
                            <button
                              key={option.code}
                              type="button"
                              disabled={isGenerating}
                              onClick={() => handleSelectRandomQuizLanguage(option.code)}
                              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer disabled:opacity-60 ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 shadow-xs'
                                  : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-base font-bold tracking-tight text-slate-900">
                                  {option.randomFlowTitle}
                                </span>
                                <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
                              </div>
                              <div className="text-xs font-semibold text-indigo-700">
                                {option.nativeSubtitle}
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {t(interfaceLanguage, option.descKey)}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {errorMessage && (
                          <motion.div
                            key="quiz-gen-error-random"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start justify-between gap-3"
                          >
                            <div className="flex items-start gap-2.5">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <div className="font-bold">
                                  {t(interfaceLanguage, 'genErrorTitle')}
                                </div>
                                <p>{errorMessage}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectRandomQuizLanguage(selectedLang)}
                              className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{t(interfaceLanguage, 'langModalRetryBtn')}</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer"
                        >
                          {t(interfaceLanguage, 'langModalCancelBtn')}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* =========================================================
                     STANDARD / QUICK 5-Q PRACTICE FLOW
                     ========================================================= */
                  <>
                    {/* Modal Header & Step Progress Indicator */}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                            {isSubjectLocked
                              ? currentStep === 'mode'
                                ? t(interfaceLanguage, 'stepBadge1Of2Lock')
                                : t(interfaceLanguage, 'stepBadge2Of2Lock')
                              : currentStep === 'mode'
                              ? t(interfaceLanguage, 'stepBadge1Of3')
                              : currentStep === 'language'
                              ? t(interfaceLanguage, 'stepBadge2Of3')
                              : t(interfaceLanguage, 'stepBadge3Of3')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-900">
                            {t(interfaceLanguage, 'classLabel')} {pendingLaunch.classLevel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-indigo-700">
                            {activeSubjectDef.name[interfaceLanguage]}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{pendingLaunch.questionCount} Questions</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-800">
                            {selectedMode === 'practice'
                              ? t(interfaceLanguage, 'durUntimed')
                              : `${timerMinutes} min Timer`}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-indigo-700">
                            {activeModeObj.title}
                          </span>
                          {pendingLaunch.kind === 'retake' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-amber-800">
                                {t(interfaceLanguage, 'langModalRetakeBadge')}
                              </span>
                            </>
                          )}
                        </div>

                        <h2
                          id="quiz-language-modal-title"
                          className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2"
                        >
                          {currentStep === 'mode' ? (
                            <SlidersHorizontal className="w-5 h-5 text-indigo-600 shrink-0" />
                          ) : currentStep === 'language' ? (
                            <Languages className="w-5 h-5 text-indigo-600 shrink-0" />
                          ) : (
                            <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
                          )}
                          <span>
                            {currentStep === 'mode'
                              ? t(interfaceLanguage, 'step1Title')
                              : currentStep === 'language'
                              ? t(interfaceLanguage, 'step2Title')
                              : t(interfaceLanguage, 'step3Title')}
                          </span>
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {currentStep === 'mode'
                            ? t(interfaceLanguage, 'step1Subtitle')
                            : currentStep === 'language'
                            ? isSubjectLocked
                              ? t(interfaceLanguage, 'step2SubtitleLock')
                              : t(interfaceLanguage, 'step2Subtitle')
                            : t(interfaceLanguage, 'step3Subtitle')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        aria-label={t(interfaceLanguage, 'langModalCancelBtn')}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Sequential Step Renderer: Mode -> Language (-> Subject when not subject-locked) */}
                    <AnimatePresence mode="wait">
                      {currentStep === 'mode' ? (
                        <motion.div
                          key="step-1-quiz-mode"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              {t(interfaceLanguage, 'selectModePrompt')}
                            </label>
                            <span className="text-[11px] font-medium text-slate-500">
                              {t(interfaceLanguage, 'classLabel')} {pendingLaunch.classLevel}
                              {isSubjectLocked ? ` · ${activeSubjectDef.name[interfaceLanguage]}` : ''}
                            </span>
                          </div>

                          <div
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch"
                            role="radiogroup"
                            aria-label={t(interfaceLanguage, 'selectModePrompt')}
                          >
                            {modeOptions.map((modeOpt) => {
                              const isSelected = selectedMode === modeOpt.id;
                              return (
                                <button
                                  key={modeOpt.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  onClick={() => setSelectedMode(modeOpt.id)}
                                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 shadow-xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {modeOpt.icon}
                                      <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                        {modeOpt.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md tabular-nums ${
                                          isSelected
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {modeOpt.badge}
                                      </span>
                                      {isSelected ? (
                                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                      ) : (
                                        <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                      )}
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {modeOpt.description}
                                  </p>
                                </button>
                              );
                            })}
                          </div>

                          {/* Mode Lock Note */}
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                            <p className="font-medium text-slate-700">
                              {t(interfaceLanguage, 'langModalExplicitNote')}
                            </p>
                          </div>

                          {/* Step 1 Footer Actions: Cancel + Continue */}
                          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={onClose}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer"
                            >
                              {t(interfaceLanguage, 'langModalCancelBtn')}
                            </button>

                            <button
                              type="button"
                              onClick={handleContinueToLanguageStep}
                              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer transition-colors"
                            >
                              <span>{t(interfaceLanguage, 'stepContinueBtn')}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ) : currentStep === 'language' ? (
                        <motion.div
                          key="step-2-quiz-language"
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <Languages className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{t(interfaceLanguage, 'quizLangLabel')}</span>
                            </label>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              {activeModeObj.icon}
                              <span className="font-semibold text-slate-900">
                                {activeModeObj.title}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="font-medium text-indigo-700">
                                {activeModeObj.badge}
                              </span>
                            </div>
                          </div>

                          <div
                            className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch"
                            role="radiogroup"
                            aria-label={t(interfaceLanguage, 'quizLangLabel')}
                          >
                            {LANGUAGE_CARD_OPTIONS.map((option) => {
                              const isSelected = selectedLang === option.code;
                              return (
                                <button
                                  key={option.code}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  onClick={() => setSelectedLang(option.code)}
                                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 shadow-xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-base font-bold tracking-tight text-slate-900">
                                      {option.title}
                                    </span>
                                    {isSelected ? (
                                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                    ) : (
                                      <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-xs font-semibold text-indigo-700">
                                    {option.nativeSubtitle}
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">
                                    {t(interfaceLanguage, option.descKey)}
                                  </p>
                                </button>
                              );
                            })}
                          </div>

                          {/* Error Display when Subject Selection step is skipped (Quick 5-Q Practice flow) */}
                          <AnimatePresence>
                            {isSubjectLocked && errorMessage && (
                              <motion.div
                                key="quiz-gen-error-step2"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start justify-between gap-3"
                              >
                                <div className="flex items-start gap-2.5">
                                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <div className="font-bold">
                                      {t(interfaceLanguage, 'genErrorTitle')}
                                    </div>
                                    <p>{errorMessage}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleConfirmStartQuiz}
                                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>{t(interfaceLanguage, 'langModalRetryBtn')}</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Step 2 Footer Actions: Back + (Start Quiz when subject-locked, or Continue when 3-step wizard) */}
                          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={handleBackToModeStep}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>{t(interfaceLanguage, 'stepBackBtn')}</span>
                            </button>

                            {isSubjectLocked ? (
                              <button
                                type="button"
                                onClick={handleConfirmStartQuiz}
                                disabled={isGenerating}
                                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer transition-colors"
                              >
                                <span>
                                  {errorMessage
                                    ? t(interfaceLanguage, 'langModalRetryBtn')
                                    : t(interfaceLanguage, 'startQuizBtn')}
                                </span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handleContinueToSubjectStep}
                                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer transition-colors"
                              >
                                <span>{t(interfaceLanguage, 'stepContinueBtn')}</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="step-3-subject-selection"
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                              <span>
                                {t(interfaceLanguage, 'selectSubjectPrompt')} (
                                {t(interfaceLanguage, 'classLabel')} {pendingLaunch.classLevel})
                              </span>
                            </label>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                              {activeModeObj.icon}
                              <span className="font-semibold text-slate-900">
                                {activeModeObj.title}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="font-semibold text-indigo-700">
                                {activeLanguageObj.title}
                              </span>
                            </div>
                          </div>

                          <div
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch"
                            role="radiogroup"
                            aria-label={t(interfaceLanguage, 'selectSubjectPrompt')}
                          >
                            {availableSubjects.map((sub) => {
                              const isSelected = wizardSubject === sub.id;
                              const subCurr = sub.curriculumByClass[pendingLaunch.classLevel];
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  onClick={() => setWizardSubject(sub.id)}
                                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 shadow-xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm sm:text-base font-bold text-slate-900">
                                      {sub.name[interfaceLanguage]}
                                    </span>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md tabular-nums ${
                                          isSelected
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {subCurr.chapters.length} Chapters
                                      </span>
                                      {isSelected ? (
                                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                      ) : (
                                        <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-[11px] font-semibold text-indigo-700">
                                    {getCurriculumStatusBadgeLabel(subCurr.status, interfaceLanguage)}
                                  </div>

                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {sub.shortDesc[interfaceLanguage]}
                                  </p>
                                </button>
                              );
                            })}
                          </div>

                          {activeSubjectCurriculum && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-2">
                              <span className="font-medium text-slate-700">
                                {activeSubjectCurriculum.boardNote[interfaceLanguage]}
                              </span>
                            </div>
                          )}

                          {/* Error Display (in Website Interface Language) with Retry Preservation */}
                          <AnimatePresence>
                            {errorMessage && (
                              <motion.div
                                key="quiz-gen-error"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start justify-between gap-3"
                              >
                                <div className="flex items-start gap-2.5">
                                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <div className="font-bold">
                                      {t(interfaceLanguage, 'genErrorTitle')}
                                    </div>
                                    <p>{errorMessage}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleConfirmStartQuiz}
                                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>{t(interfaceLanguage, 'langModalRetryBtn')}</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Step 3 Footer Actions: Back + Prominent Start Quiz Button */}
                          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={handleBackToLanguageStep}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>{t(interfaceLanguage, 'stepBackBtn')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleConfirmStartQuiz}
                              disabled={isGenerating}
                              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer transition-colors"
                            >
                              <span>
                                {errorMessage
                                  ? t(interfaceLanguage, 'langModalRetryBtn')
                                  : t(interfaceLanguage, 'startQuizBtn')}
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
