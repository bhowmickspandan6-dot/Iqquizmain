import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Languages,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  X,
  Lock,
  BookOpen,
  Clock,
  ShieldCheck,
  Flame,
  SlidersHorizontal,
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
import { getSubjectDefinition } from '../data/curriculum';

export interface PendingQuizLaunch {
  kind: 'standard' | 'random' | 'retake' | 'notes';
  classLevel: ClassLevel;
  subject: SubjectId;
  topic: string;
  questionCount: number;
  durationMinutes?: number;
  mode: QuizMode;
  originalAttemptId?: string;
}

interface QuizLanguageModalProps {
  pendingLaunch: PendingQuizLaunch | null;
  interfaceLanguage: LanguageCode;
  defaultQuizLanguage?: LanguageCode;
  isGenerating: boolean;
  errorMessage: string | null;
  onConfirmLanguageAndStart: (
    selectedQuizLanguage: LanguageCode,
    selectedQuizMode: SelectableQuizMode
  ) => Promise<void>;
  onClose: () => void;
}

const LANGUAGE_CARD_OPTIONS: {
  code: LanguageCode;
  title: string;
  nativeSubtitle: string;
  descKey: string;
}[] = [
  {
    code: 'en',
    title: '🇬🇧 English',
    nativeSubtitle: 'English Medium Quiz',
    descKey: 'langCardEnDesc',
  },
  {
    code: 'bn',
    title: 'বাংলা',
    nativeSubtitle: 'বাংলা মাধ্যমে কুইজ',
    descKey: 'langCardBnDesc',
  },
  {
    code: 'hi',
    title: 'हिन्दी',
    nativeSubtitle: 'हिन्दी माध्यम में क्विज़',
    descKey: 'langCardHiDesc',
  },
];

export const QuizLanguageModal: React.FC<QuizLanguageModalProps> = ({
  pendingLaunch,
  interfaceLanguage,
  defaultQuizLanguage = 'en',
  isGenerating,
  errorMessage,
  onConfirmLanguageAndStart,
  onClose,
}) => {
  const [selectedMode, setSelectedMode] = useState<SelectableQuizMode>('practice');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(defaultQuizLanguage);

  useEffect(() => {
    if (pendingLaunch) {
      setSelectedMode(normalizeQuizMode(pendingLaunch.mode));
      setSelectedLang(defaultQuizLanguage || interfaceLanguage || 'en');
    }
  }, [pendingLaunch, defaultQuizLanguage, interfaceLanguage]);

  const subjectDef = pendingLaunch ? getSubjectDefinition(pendingLaunch.subject) : null;
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

  const handleConfirm = async () => {
    if (!selectedLang || !selectedMode || isGenerating) return;
    await onConfirmLanguageAndStart(selectedLang, selectedMode);
  };

  return (
    <AnimatePresence>
      {(isGenerating || (pendingLaunch && subjectDef)) && (
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
            ) : pendingLaunch && subjectDef ? (
              <motion.div
                key="quiz-lang-modal-card"
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-xl space-y-5 my-auto max-h-[92dvh] overflow-y-auto"
              >
                {/* Modal Header & Context Metadata */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-900">
                        {t(interfaceLanguage, 'classLabel')} {pendingLaunch.classLevel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-indigo-700">
                        {subjectDef.name[interfaceLanguage]}
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
                      {pendingLaunch.kind === 'random' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-indigo-700">
                            {t(interfaceLanguage, 'langModalRandomBadge')}
                          </span>
                        </>
                      )}
                    </div>

                    <h2
                      id="quiz-language-modal-title"
                      className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2"
                    >
                      <SlidersHorizontal className="w-5 h-5 text-indigo-600 shrink-0" />
                      <span>{t(interfaceLanguage, 'langModalTitle')}</span>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {t(interfaceLanguage, 'langModalSubtitle')}
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

                {/* SECTION 1: Quiz Mode Selection (4 Professional Mode Cards) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      1. {t(interfaceLanguage, 'selectModePrompt')}
                    </label>
                    <span className="text-[11px] font-medium text-slate-500">
                      Topic: <strong className="text-slate-700">{pendingLaunch.topic}</strong>
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
                </div>

                {/* SECTION 2: Quiz Language Selection (3 Language Cards) */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-indigo-600" />
                    <span>2. {t(interfaceLanguage, 'quizLangLabel')}</span>
                  </label>

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
                          className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                              {option.title}
                            </span>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] font-semibold text-indigo-700">
                            {option.nativeSubtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mode Lock & Independence Note */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <p className="font-medium text-slate-700">
                    {t(interfaceLanguage, 'langModalExplicitNote')}
                  </p>
                </div>

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
                          <div className="font-bold">{t(interfaceLanguage, 'genErrorTitle')}</div>
                          <p>{errorMessage}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{t(interfaceLanguage, 'langModalRetryBtn')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Actions: Cancel + Prominent Start Quiz Button */}
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
                    onClick={handleConfirm}
                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer transition-colors"
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
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
