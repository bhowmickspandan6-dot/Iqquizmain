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
  BookCheck,
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
  CLASS_LEVELS,
  ClassSubjectCurriculum,
  CurriculumChapter,
  getClassSubjectCurriculum,
  getChapterDisplayName,
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
  skipClassStep?: boolean;
  skipChapterStep?: boolean;
  showChapterStep?: boolean;
  flowType?: 'start_quiz' | 'configure_card' | 'quick_practice' | 'random' | 'retake' | 'notes';
}

export type QuizStartStep = 'class' | 'mode' | 'language' | 'subject' | 'chapter';

interface QuizLanguageModalProps {
  pendingLaunch: PendingQuizLaunch | null;
  interfaceLanguage: LanguageCode;
  defaultQuizLanguage?: LanguageCode;
  isGenerating: boolean;
  errorMessage: string | null;
  onConfirmLanguageAndStart: (
    selectedQuizLanguage: LanguageCode,
    selectedQuizMode: SelectableQuizMode,
    selectedSubject: SubjectId,
    selectedChapter?: string,
    selectedClass?: ClassLevel
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
  const [wizardClass, setWizardClass] = useState<ClassLevel>(8);
  const [selectedMode, setSelectedMode] = useState<SelectableQuizMode>('practice');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(defaultQuizLanguage);
  const [wizardSubject, setWizardSubject] = useState<SubjectId>('mathematics');
  const [wizardTopic, setWizardTopic] = useState<string>('All Verified Chapters');
  const inFlightSubmitRef = useRef<boolean>(false);

  const isRandomQuizFlow = pendingLaunch?.kind === 'random';
  const isStartQuizFlow =
    pendingLaunch?.flowType === 'start_quiz' ||
    (pendingLaunch?.kind === 'standard' &&
      !pendingLaunch.skipClassStep &&
      !pendingLaunch.skipSubjectStep);
  const isConfigureCardFlow =
    pendingLaunch?.flowType === 'configure_card' ||
    (Boolean(pendingLaunch?.skipSubjectStep) && Boolean(pendingLaunch?.showChapterStep));
  const isSubjectLocked = Boolean(pendingLaunch?.skipSubjectStep);

  const effectiveClass: ClassLevel = isStartQuizFlow
    ? wizardClass
    : pendingLaunch?.classLevel ?? wizardClass;

  const effectiveSubject: SubjectId =
    (isSubjectLocked || isRandomQuizFlow) && pendingLaunch
      ? pendingLaunch.subject
      : wizardSubject;

  // Reset modal step and state when a new pendingLaunch session opens
  useEffect(() => {
    if (pendingLaunch) {
      const cls = pendingLaunch.classLevel || 8;
      setWizardClass(cls);
      const classSubjects = getSubjectsForClass(cls);

      setSelectedMode(normalizeQuizMode(pendingLaunch.mode));
      setSelectedLang(defaultQuizLanguage || interfaceLanguage || 'en');
      setWizardTopic(pendingLaunch.topic || 'All Verified Chapters');

      if (pendingLaunch.kind === 'random') {
        setCurrentStep('language');
        setWizardSubject(pendingLaunch.subject);
      } else if (isStartQuizFlow) {
        // Start Quiz flow starts at Step 1: Select Class
        setCurrentStep('class');
        setWizardSubject((prev) =>
          classSubjects.some((s) => s.id === prev)
            ? prev
            : classSubjects[0]?.id || 'mathematics'
        );
      } else {
        // Configure Quiz or Quick Practice starts at Mode
        setCurrentStep('mode');
        setWizardSubject(pendingLaunch.subject);
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

  // When wizardClass changes in Start Quiz flow, keep wizardSubject aligned with valid subjects
  const availableSubjectsForEffectiveClass = getSubjectsForClass(effectiveClass);

  useEffect(() => {
    if (isStartQuizFlow) {
      const validForClass = availableSubjectsForEffectiveClass.some(
        (s) => s.id === wizardSubject
      );
      if (!validForClass) {
        setWizardSubject(availableSubjectsForEffectiveClass[0]?.id || 'mathematics');
        setWizardTopic('All Verified Chapters');
      }
    }
  }, [effectiveClass, isStartQuizFlow, availableSubjectsForEffectiveClass, wizardSubject]);

  const activeSubjectDef =
    availableSubjectsForEffectiveClass.find((s) => s.id === effectiveSubject) ||
    getSubjectDefinition(effectiveSubject);

  const activeSubjectCurriculum = getClassSubjectCurriculum(
    effectiveClass,
    effectiveSubject
  );

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

  // Navigation handlers
  const handleContinueFromClassStep = () => {
    setCurrentStep('mode');
  };

  const handleContinueFromModeStep = () => {
    if (!selectedMode || isGenerating) return;
    setCurrentStep('language');
  };

  const handleBackToClassStep = () => {
    if (isGenerating) return;
    setCurrentStep('class');
  };

  const handleBackToModeStep = () => {
    if (isGenerating) return;
    setCurrentStep('mode');
  };

  const handleContinueFromLanguageStep = () => {
    if (!selectedLang || isGenerating) return;
    if (isStartQuizFlow) {
      // Step 4: Subject Selection
      setCurrentStep('subject');
    } else if (isConfigureCardFlow) {
      // Dashboard Configure Quiz skips Subject and goes straight to Chapter Selection
      setCurrentStep('chapter');
    }
  };

  const handleBackToLanguageStep = () => {
    if (isGenerating) return;
    setCurrentStep('language');
  };

  const handleContinueFromSubjectStep = () => {
    if (!wizardSubject || isGenerating) return;
    // Step 5: Chapter Selection
    setCurrentStep('chapter');
  };

  const handleBackToSubjectStep = () => {
    if (isGenerating) return;
    if (isStartQuizFlow) {
      setCurrentStep('subject');
    } else {
      // In configure_card flow, subject step was skipped, go back to language
      setCurrentStep('language');
    }
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
        pendingLaunch.subject,
        pendingLaunch.topic,
        pendingLaunch.classLevel
      );
    } finally {
      inFlightSubmitRef.current = false;
    }
  };

  const handleConfirmStartQuiz = async () => {
    if (
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
      await onConfirmLanguageAndStart(
        selectedLang,
        selectedMode,
        effectiveSubject,
        wizardTopic,
        effectiveClass
      );
    } finally {
      inFlightSubmitRef.current = false;
    }
  };

  // Badge text for current step
  const getStepBadgeText = (): string => {
    if (isRandomQuizFlow) return t(interfaceLanguage, 'langModalRandomBadge');
    if (isStartQuizFlow) {
      if (currentStep === 'class') return t(interfaceLanguage, 'stepBadge1Of5');
      if (currentStep === 'mode') return t(interfaceLanguage, 'stepBadge2Of5');
      if (currentStep === 'language') return t(interfaceLanguage, 'stepBadge3Of5');
      if (currentStep === 'subject') return t(interfaceLanguage, 'stepBadge4Of5');
      return t(interfaceLanguage, 'stepBadge5Of5');
    }
    if (isConfigureCardFlow) {
      if (currentStep === 'mode') return t(interfaceLanguage, 'stepBadgeCard1Of3');
      if (currentStep === 'language') return t(interfaceLanguage, 'stepBadgeCard2Of3');
      return t(interfaceLanguage, 'stepBadgeCard3Of3');
    }
    // Quick 5-Q practice or other 2-step flows
    if (currentStep === 'mode') return t(interfaceLanguage, 'stepBadge1Of2Lock');
    return t(interfaceLanguage, 'stepBadge2Of2Lock');
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
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 select-none pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                  <GraduationCap className="w-6 h-6 text-indigo-600 absolute" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {t(interfaceLanguage, 'langModalGeneratingBtn')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Class {effectiveClass} · {activeSubjectDef.name[interfaceLanguage]}
                  </p>
                  <p className="text-[11px] text-indigo-600 font-medium">
                    {LANGUAGE_CARD_OPTIONS.find((l) => l.code === selectedLang)?.nativeSubtitle}
                  </p>
                </div>
              </motion.div>
            ) : pendingLaunch ? (
              <motion.div
                key="quiz-language-modal-card"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-7 space-y-5 my-auto max-h-[92vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* RANDOM QUIZ FLOW */}
                {isRandomQuizFlow ? (
                  <>
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                            {t(interfaceLanguage, 'langModalRandomBadge')}
                          </span>
                          <span className="text-xs text-slate-500">
                            Class {effectiveClass} · {activeSubjectDef.name[interfaceLanguage]}
                          </span>
                        </div>
                        <h2
                          id="quiz-language-modal-title"
                          className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2"
                        >
                          <Languages className="w-5 h-5 text-indigo-600 shrink-0" />
                          <span>{t(interfaceLanguage, 'quizLangLabel')}</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600">
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

                    <div
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch"
                      role="radiogroup"
                      aria-label={t(interfaceLanguage, 'quizLangLabel')}
                    >
                      {LANGUAGE_CARD_OPTIONS.map((option) => (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => handleSelectRandomQuizLanguage(option.code)}
                          disabled={isGenerating}
                          className="p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer border-slate-200 bg-white hover:border-indigo-600 hover:bg-indigo-50/50 hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-base font-bold text-slate-900">
                              {option.title}
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
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer"
                      >
                        {t(interfaceLanguage, 'langModalCancelBtn')}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* STANDARD / CONFIGURE / PRACTICE MULTI-STEP FLOW */}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                            {getStepBadgeText()}
                          </span>
                          <span className="text-slate-500 font-medium">
                            Class {effectiveClass}
                          </span>
                          {isSubjectLocked && (
                            <>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="font-semibold text-slate-700 truncate">
                                {activeSubjectDef.name[interfaceLanguage]}
                              </span>
                            </>
                          )}
                        </div>

                        <h2
                          id="quiz-language-modal-title"
                          className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2"
                        >
                          {currentStep === 'class' ? (
                            <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
                          ) : currentStep === 'mode' ? (
                            <SlidersHorizontal className="w-5 h-5 text-indigo-600 shrink-0" />
                          ) : currentStep === 'language' ? (
                            <Languages className="w-5 h-5 text-indigo-600 shrink-0" />
                          ) : currentStep === 'subject' ? (
                            <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
                          ) : (
                            <BookCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                          )}
                          <span>
                            {currentStep === 'class'
                              ? t(interfaceLanguage, 'stepClassTitle')
                              : currentStep === 'mode'
                              ? isStartQuizFlow
                                ? t(interfaceLanguage, 'stepModeTitle')
                                : t(interfaceLanguage, 'step1Title')
                              : currentStep === 'language'
                              ? isStartQuizFlow
                                ? t(interfaceLanguage, 'stepLanguageTitle')
                                : t(interfaceLanguage, 'step2Title')
                              : currentStep === 'subject'
                              ? t(interfaceLanguage, 'stepSubjectTitle')
                              : isStartQuizFlow
                              ? t(interfaceLanguage, 'stepChapterTitle')
                              : t(interfaceLanguage, 'stepCardChapterTitle')}
                          </span>
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {currentStep === 'class'
                            ? t(interfaceLanguage, 'stepClassSubtitle')
                            : currentStep === 'mode'
                            ? t(interfaceLanguage, 'step1Subtitle')
                            : currentStep === 'language'
                            ? isSubjectLocked && !isConfigureCardFlow
                              ? t(interfaceLanguage, 'step2SubtitleLock')
                              : t(interfaceLanguage, 'step2Subtitle')
                            : currentStep === 'subject'
                            ? t(interfaceLanguage, 'step3Subtitle')
                            : isStartQuizFlow
                            ? t(interfaceLanguage, 'stepChapterSubtitle')
                            : t(interfaceLanguage, 'stepCardChapterSubtitle')}
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

                    {/* Step Renderer */}
                    <AnimatePresence mode="wait">
                      {/* STEP 1 (Start Quiz only): CLASS SELECTION */}
                      {currentStep === 'class' ? (
                        <motion.div
                          key="step-class-selection"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="space-y-4"
                        >
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                            {t(interfaceLanguage, 'selectClassPrompt')}
                          </label>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CLASS_LEVELS.map((cls) => {
                              const isSelected = wizardClass === cls;
                              const classSubjects = getSubjectsForClass(cls);
                              return (
                                <button
                                  key={cls}
                                  type="button"
                                  onClick={() => setWizardClass(cls)}
                                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 shadow-xs'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-base font-bold text-slate-900">
                                      Class {cls}
                                    </span>
                                    {isSelected ? (
                                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                    ) : (
                                      <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500 font-medium">
                                    {classSubjects.length} Verified Subjects
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={onClose}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer"
                            >
                              {t(interfaceLanguage, 'langModalCancelBtn')}
                            </button>

                            <button
                              type="button"
                              onClick={handleContinueFromClassStep}
                              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer transition-colors"
                            >
                              <span>{t(interfaceLanguage, 'stepContinueBtn')}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ) : currentStep === 'mode' ? (
                        /* STEP: QUIZ MODE */
                        <motion.div
                          key="step-quiz-mode"
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
                              Class {effectiveClass}
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

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                            <p className="font-medium text-slate-700">
                              {t(interfaceLanguage, 'langModalExplicitNote')}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            {isStartQuizFlow ? (
                              <button
                                type="button"
                                onClick={handleBackToClassStep}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <ArrowLeft className="w-4 h-4" />
                                <span>{t(interfaceLanguage, 'stepBackBtn')}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer"
                              >
                                {t(interfaceLanguage, 'langModalCancelBtn')}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={handleContinueFromModeStep}
                              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer transition-colors"
                            >
                              <span>{t(interfaceLanguage, 'stepContinueBtn')}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ) : currentStep === 'language' ? (
                        /* STEP: QUIZ LANGUAGE */
                        <motion.div
                          key="step-quiz-language"
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

                          {/* Quick 5-Q Practice final start or Continue */}
                          <AnimatePresence>
                            {!isStartQuizFlow && !isConfigureCardFlow && errorMessage && (
                              <motion.div
                                key="quiz-gen-error-step-lang"
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
                                  disabled={isGenerating}
                                  onClick={handleConfirmStartQuiz}
                                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer transition-opacity"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                                  <span>{t(interfaceLanguage, 'langModalRetryBtn')}</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={handleBackToModeStep}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>{t(interfaceLanguage, 'stepBackBtn')}</span>
                            </button>

                            {/* If Quick 5-Q Practice (not start_quiz and not configure_card), generate directly from here */}
                            {!isStartQuizFlow && !isConfigureCardFlow ? (
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
                                onClick={handleContinueFromLanguageStep}
                                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer transition-colors"
                              >
                                <span>{t(interfaceLanguage, 'stepContinueBtn')}</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ) : currentStep === 'subject' ? (
                        /* STEP 4 (Start Quiz ONLY): SUBJECT SELECTION */
                        <motion.div
                          key="step-subject-selection"
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
                                {t(interfaceLanguage, 'selectSubjectPrompt')} (Class {effectiveClass})
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
                            {availableSubjectsForEffectiveClass.map((sub) => {
                              const isSelected = wizardSubject === sub.id;
                              const subCurr = sub.curriculumByClass[effectiveClass];
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  onClick={() => {
                                    setWizardSubject(sub.id);
                                    setWizardTopic('All Verified Chapters');
                                  }}
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
                                        {subCurr?.chapters.length || 0} Chapters
                                      </span>
                                      {isSelected ? (
                                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                      ) : (
                                        <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                                      )}
                                    </div>
                                  </div>

                                  {subCurr && (
                                    <div className="text-[11px] font-semibold text-indigo-700">
                                      {getCurriculumStatusBadgeLabel(subCurr.status, interfaceLanguage)}
                                    </div>
                                  )}

                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {sub.shortDesc[interfaceLanguage]}
                                  </p>
                                </button>
                              );
                            })}
                          </div>

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
                              onClick={handleContinueFromSubjectStep}
                              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer transition-colors"
                            >
                              <span>{t(interfaceLanguage, 'stepContinueBtn')}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        /* STEP: CHAPTER SELECTION (Final step before generation!) */
                        <motion.div
                          key="step-chapter-selection"
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <BookCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>
                                {t(interfaceLanguage, 'selectTopicPrompt')} · Class {effectiveClass}
                              </span>
                            </label>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                              <span className="font-bold text-slate-900">
                                {activeSubjectDef.name[interfaceLanguage]}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="font-semibold text-indigo-700">
                                {activeLanguageObj.title}
                              </span>
                            </div>
                          </div>

                          {/* Chapter selection list */}
                          <div
                            className="space-y-2 max-h-[46vh] overflow-y-auto pr-1"
                            role="radiogroup"
                            aria-label={t(interfaceLanguage, 'selectTopicPrompt')}
                          >
                            {/* Option 1: All Verified Chapters */}
                            {(() => {
                              const isAllSelected =
                                wizardTopic === 'All Verified Chapters' || !wizardTopic;
                              const allChaptersLabel =
                                effectiveSubject === 'hindi' || effectiveSubject === 'hindi_subject'
                                  ? 'सभी सत्यापित अध्याय (All Verified Chapters)'
                                  : 'সকল যাচাইকৃত অধ্যায় (All Verified Chapters)';
                              return (
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={isAllSelected}
                                  onClick={() => setWizardTopic('All Verified Chapters')}
                                  className={`w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                    isAllSelected
                                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 font-bold'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="text-sm font-bold text-slate-900">
                                      {allChaptersLabel}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      Comprehensive practice across all {activeSubjectCurriculum?.chapters.length || 0} textbook chapters
                                    </div>
                                  </div>
                                  {isAllSelected ? (
                                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                                  ) : (
                                    <span className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                                  )}
                                </button>
                              );
                            })()}

                            {/* Each Verified Chapter — Bengali for all, Hindi for Hindi */}
                            {activeSubjectCurriculum?.chapters.map((ch: CurriculumChapter) => {
                              const isSelected = wizardTopic === ch.title.en;
                              const displayName = getChapterDisplayName(ch, effectiveSubject);
                              return (
                                <button
                                  key={ch.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  onClick={() => setWizardTopic(ch.title.en)}
                                  className={`w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="text-sm font-bold text-slate-900 leading-snug">
                                      {displayName}
                                    </div>
                                    {ch.topics && ch.topics.length > 0 && (
                                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                        {ch.topics.slice(0, 3).join(' · ')}
                                      </div>
                                    )}
                                  </div>
                                  {isSelected ? (
                                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                                  ) : (
                                    <span className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Error Display with Retry */}
                          <AnimatePresence>
                            {errorMessage && (
                              <motion.div
                                key="quiz-gen-error-step-chapter"
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
                                  disabled={isGenerating}
                                  onClick={handleConfirmStartQuiz}
                                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer transition-opacity"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                                  <span>{t(interfaceLanguage, 'langModalRetryBtn')}</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Footer Actions: Back + Prominent START QUIZ Button */}
                          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={handleBackToSubjectStep}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>{t(interfaceLanguage, 'stepBackBtn')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleConfirmStartQuiz}
                              disabled={isGenerating}
                              className="px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-bold flex items-center gap-2.5 shadow-md cursor-pointer transition-colors"
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
