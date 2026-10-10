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
} from 'lucide-react';
import { ClassLevel, LanguageCode, SubjectId } from '../types';
import { t } from '../i18n/translations';
import { getSubjectDefinition } from '../data/curriculum';

export interface PendingQuizLaunch {
  kind: 'standard' | 'random' | 'retake' | 'notes';
  classLevel: ClassLevel;
  subject: SubjectId;
  topic: string;
  questionCount: number;
  mode: 'practice' | 'test';
  originalAttemptId?: string;
}

interface QuizLanguageModalProps {
  pendingLaunch: PendingQuizLaunch | null;
  interfaceLanguage: LanguageCode;
  isGenerating: boolean;
  errorMessage: string | null;
  onConfirmLanguageAndStart: (selectedQuizLanguage: LanguageCode) => Promise<void>;
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
  isGenerating,
  errorMessage,
  onConfirmLanguageAndStart,
  onClose,
}) => {
  // CRITICAL: Do not automatically select a language.
  // Require the student to make an explicit selection for every new quiz attempt.
  const [selectedLang, setSelectedLang] = useState<LanguageCode | null>(null);

  useEffect(() => {
    if (pendingLaunch) {
      setSelectedLang(null);
    }
  }, [pendingLaunch]);

  const subjectDef = pendingLaunch ? getSubjectDefinition(pendingLaunch.subject) : null;

  const handleConfirm = async () => {
    if (!selectedLang || isGenerating) return;
    await onConfirmLanguageAndStart(selectedLang);
  };

  return (
    <AnimatePresence>
      {pendingLaunch && subjectDef && (
        <motion.div
          key="quiz-lang-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-language-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isGenerating) {
              onClose();
            }
          }}
        >
          <motion.div
            key="quiz-lang-modal-card"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-6 my-auto"
          >
            {/* Modal Header & Context Metadata */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
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
                  <span>
                    {pendingLaunch.mode === 'test'
                      ? t(interfaceLanguage, 'modeTest')
                      : t(interfaceLanguage, 'modePractice')}
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
                  className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5"
                >
                  <Languages className="w-6 h-6 text-indigo-600 shrink-0" />
                  <span>{t(interfaceLanguage, 'langModalTitle')}</span>
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(interfaceLanguage, 'langModalSubtitle')}
                </p>
              </div>

              <button
                type="button"
                disabled={isGenerating}
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
                aria-label={t(interfaceLanguage, 'langModalCancelBtn')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Three Equally Prominent Language Selection Cards */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch"
              role="radiogroup"
              aria-label={t(interfaceLanguage, 'langModalTitle')}
            >
              {LANGUAGE_CARD_OPTIONS.map((option, idx) => {
                const isSelected = selectedLang === option.code;
                return (
                  <motion.button
                    key={option.code}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isGenerating}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: idx * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={!isGenerating ? { y: -3, scale: 1.01 } : undefined}
                    whileTap={!isGenerating ? { scale: 0.98 } : undefined}
                    onClick={() => setSelectedLang(option.code)}
                    className={`p-5 rounded-xl border-2 text-left transition-colors flex flex-col justify-between gap-4 cursor-pointer min-h-40 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                    } ${isGenerating ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                          {option.title}
                        </span>
                        {isSelected ? (
                          <motion.span
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.16 }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                          </motion.span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-indigo-700">
                        {option.nativeSubtitle}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(interfaceLanguage, option.descKey)}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Loading Skeleton Preview While Generating Quiz in Selected Language */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  key="quiz-gen-skeleton"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3"
                    aria-live="polite"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>{t(interfaceLanguage, 'generatingQuizMsg')}</span>
                      </span>
                      <span className="font-mono tabular-nums text-indigo-700">
                        {pendingLaunch.questionCount} Qs
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-4/5 rounded-md edu-skeleton" />
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="h-8 rounded-lg edu-skeleton" />
                        <div className="h-8 rounded-lg edu-skeleton" />
                        <div className="h-8 rounded-lg edu-skeleton" />
                        <div className="h-8 rounded-lg edu-skeleton" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Independence & Explicit Selection Note */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-medium text-slate-800">
                  {t(interfaceLanguage, 'langModalExplicitNote')}
                </p>
                <p className="text-slate-500">
                  Topic: <strong>{pendingLaunch.topic}</strong>
                </p>
              </div>
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
                  {selectedLang && !isGenerating && (
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t(interfaceLanguage, 'langModalRetryBtn')}</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Actions: Cancel + Prominent Continue Button */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={isGenerating}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer disabled:opacity-40"
              >
                {t(interfaceLanguage, 'langModalCancelBtn')}
              </button>

              <AnimatePresence mode="wait">
                {selectedLang ? (
                  <motion.button
                    key="continue-enabled"
                    type="button"
                    disabled={isGenerating}
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    onClick={handleConfirm}
                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white text-sm font-bold flex items-center gap-2.5 shadow-sm cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t(interfaceLanguage, 'langModalGeneratingBtn')}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {errorMessage
                            ? t(interfaceLanguage, 'langModalRetryBtn')
                            : t(interfaceLanguage, 'langModalContinueBtn')}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.div
                    key="continue-prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-amber-700 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
                  >
                    Select 🇬🇧 English, বাংলা, or हिन्दी above to enable Continue
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
