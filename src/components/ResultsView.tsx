import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Lock,
  RotateCcw,
  PlusCircle,
  Clock,
  Award,
  BookOpen,
} from 'lucide-react';
import { LanguageCode, QuizAttemptState } from '../types';
import { t, LANGUAGE_LABELS } from '../i18n/translations';
import { getSubjectDefinition } from '../data/curriculum';

interface ResultsViewProps {
  attempt: QuizAttemptState;
  interfaceLanguage: LanguageCode;
  onRetakeQuiz: (originalAttemptId: string) => Promise<void>;
  onGenerateNewQuiz: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  attempt,
  interfaceLanguage,
  onRetakeQuiz,
  onGenerateNewQuiz,
}) => {
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect'>('all');
  const [retaking, setRetaking] = useState(false);

  const summary = attempt.scoreSummary || {
    totalQuestions: attempt.questions.length,
    correctCount: Object.values(attempt.lockedAnswers).filter((a) => a.isCorrect).length,
    incorrectCount: Object.values(attempt.lockedAnswers).filter((a) => a.isCorrect === false)
      .length,
    unansweredCount:
      attempt.questions.length - Object.keys(attempt.lockedAnswers).length,
    score: Object.values(attempt.lockedAnswers).filter((a) => a.isCorrect).length,
    maxScore: attempt.questions.length,
    percentage: Math.round(
      (Object.values(attempt.lockedAnswers).filter((a) => a.isCorrect).length /
        Math.max(1, attempt.questions.length)) *
        100
    ),
    timeTakenSeconds: attempt.timeTakenSeconds || 0,
    topicBreakdown: [],
  };

  const subjectDef = getSubjectDefinition(attempt.config.subject);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const filteredQuestions = attempt.questions.filter((q) => {
    if (reviewFilter === 'all') return true;
    const lock = attempt.lockedAnswers[q.id];
    // Show incorrect locked answers and unanswered questions in review incorrect tab
    return !lock || lock.isCorrect === false;
  });

  const handleRetake = async () => {
    setRetaking(true);
    try {
      await onRetakeQuiz(attempt.attemptId);
    } finally {
      setRetaking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Official Results Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                {t(interfaceLanguage, 'classLabel')} {attempt.config.classLevel}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-800">
                {subjectDef.name[interfaceLanguage]}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t(interfaceLanguage, 'quizLangLabel')}:{' '}
                {LANGUAGE_LABELS[attempt.config.quizLanguage]}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {attempt.config.mode === 'test'
                  ? t(interfaceLanguage, 'modeTest')
                  : t(interfaceLanguage, 'modePractice')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t(interfaceLanguage, 'resultsTitle')}
            </h1>
            <p className="text-sm text-slate-600">
              {t(interfaceLanguage, 'resultsSub')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={retaking}
              onClick={handleRetake}
              className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              title={t(interfaceLanguage, 'retakeNotice')}
            >
              <RotateCcw className="w-4 h-4" />
              {retaking
                ? 'Opening Language Selection...'
                : t(interfaceLanguage, 'retakeQuizBtn')}
            </button>

            <button
              type="button"
              onClick={onGenerateNewQuiz}
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              {t(interfaceLanguage, 'generateNewQuizBtn')}
            </button>
          </div>
        </div>

        {/* 6-Metric Score Grid (Tabular Numerals) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">
              {t(interfaceLanguage, 'finalScoreLabel')}
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {summary.score}/{summary.maxScore} ({summary.percentage}%)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">
              {t(interfaceLanguage, 'totalQuestionsLabel')}
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {summary.totalQuestions}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="text-xs text-emerald-800">
              {t(interfaceLanguage, 'correctAnswersLabel')}
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
              {summary.correctCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-50/60 border border-red-200">
            <div className="text-xs text-red-800">
              {t(interfaceLanguage, 'incorrectAnswersLabel')}
            </div>
            <div className="text-2xl font-bold text-red-700 font-mono tabular-nums mt-1">
              {summary.incorrectCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="text-xs text-amber-800">
              {t(interfaceLanguage, 'unansweredQuestionsLabel')}
            </div>
            <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
              {summary.unansweredCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">
              {t(interfaceLanguage, 'timeTakenLabel')}
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              {formatDuration(summary.timeTakenSeconds)}
            </div>
          </div>
        </div>

        {/* Topic-Wise Performance Breakdown */}
        {summary.topicBreakdown && summary.topicBreakdown.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              {t(interfaceLanguage, 'topicBreakdownTitle')}
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-2.5 px-4">Topic / Chapter</th>
                    <th className="py-2.5 px-4 text-right">Questions</th>
                    <th className="py-2.5 px-4 text-right">Correct</th>
                    <th className="py-2.5 px-4 text-right">Incorrect</th>
                    <th className="py-2.5 px-4 text-right">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {summary.topicBreakdown.map((tb, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {tb.topic}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {tb.total}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                        {tb.correct}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-red-700">
                        {tb.incorrect}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                        {tb.accuracy}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Read-Only Question & Answer Explanation Review */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Interactive Segmented Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                reviewFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t(interfaceLanguage, 'reviewAllTab')} ({attempt.questions.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('incorrect')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                reviewFilter === 'incorrect'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t(interfaceLanguage, 'reviewIncorrectTab')} (
              {summary.incorrectCount + summary.unansweredCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>{t(interfaceLanguage, 'readOnlyReviewNotice')}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {filteredQuestions.length === 0 ? (
            <motion.div
              key="empty-incorrect"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-base font-bold text-slate-900">
                100% Accuracy — No Incorrect or Unanswered Questions!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={reviewFilter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {filteredQuestions.map((q) => {
                const originalIndex = attempt.questions.findIndex((item) => item.id === q.id);
                const lock = attempt.lockedAnswers[q.id];
                const correctIdx =
                  typeof q.correctIndex === 'number'
                    ? q.correctIndex
                    : lock?.correctIndex ?? 0;
                const explanation = q.explanation || lock?.explanation || '';

                return (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-bold text-slate-900 tabular-nums">
                          Question {originalIndex + 1}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{q.topic}</span>
                        <span aria-hidden="true">·</span>
                        <span>{q.difficulty.toUpperCase()}</span>
                      </div>

                      <div>
                        {!lock ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <MinusCircle className="w-4 h-4" />
                            Unanswered (0 Marks)
                          </span>
                        ) : lock.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4" />
                            Locked Correct (+1 Mark)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                            <XCircle className="w-4 h-4" />
                            Locked Incorrect (0 Marks)
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-base font-semibold text-slate-900 leading-relaxed">
                      {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOpt = oIdx === correctIdx;
                        const isUserSelected = lock?.selectedIndex === oIdx;

                        let boxStyle = 'border-slate-200 bg-slate-50/60 text-slate-700';
                        if (isCorrectOpt) {
                          boxStyle = 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold';
                        } else if (isUserSelected && !isCorrectOpt) {
                          boxStyle = 'border-red-600 bg-red-50/70 text-red-950 font-semibold';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-lg border text-sm flex items-center justify-between gap-2 ${boxStyle}`}
                          >
                            <span>
                              <strong className="font-mono mr-1.5">
                                ({String.fromCharCode(65 + oIdx)})
                              </strong>
                              {opt}
                            </span>
                            <span className="text-xs shrink-0 flex items-center gap-1">
                              {isCorrectOpt && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              )}
                              {isUserSelected && !isCorrectOpt && (
                                <XCircle className="w-4 h-4 text-red-700" />
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {explanation && (
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-1">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{t(interfaceLanguage, 'explanationHeading')}</span>
                        </div>
                        <p className="leading-relaxed">{explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
