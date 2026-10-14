import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  CheckCircle2,
  BookCheck,
  Check,
} from 'lucide-react';
import { ClassLevel, LanguageCode, SubjectId } from '../types';
import { t } from '../i18n/translations';
import {
  CurriculumChapter,
  getClassSubjectCurriculum,
  getChapterDisplayName,
  getSubjectDefinition,
} from '../data/curriculum';

interface ConfigureChapterModalProps {
  isOpen: boolean;
  classLevel: ClassLevel;
  subjectId: SubjectId;
  interfaceLanguage: LanguageCode;
  selectedChapter: string;
  onSave: (chapter: string) => void;
  onClose: () => void;
}

export const ConfigureChapterModal: React.FC<ConfigureChapterModalProps> = ({
  isOpen,
  classLevel,
  subjectId,
  interfaceLanguage,
  selectedChapter,
  onSave,
  onClose,
}) => {
  const [tempSelected, setTempSelected] = useState<string>(selectedChapter || 'All Verified Chapters');

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedChapter || 'All Verified Chapters');
    }
  }, [isOpen, selectedChapter]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subDef = getSubjectDefinition(subjectId);
  const curriculum = getClassSubjectCurriculum(classLevel, subjectId);
  const chapters = curriculum.chapters || [];

  const isHindiSubject = subjectId === 'hindi' || subjectId === 'hindi_subject';
  const allChaptersLabel = isHindiSubject
    ? 'सभी सत्यापित अध्याय (All Verified Chapters)'
    : 'সকল যাচাইকৃত অধ্যায় (All Verified Chapters)';

  const handleApply = () => {
    onSave(tempSelected);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="configure-chapter-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="fixed inset-0 w-screen h-dvh bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto select-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="configure-chapter-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          key="configure-chapter-modal-content"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 shrink-0">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                  Class {classLevel}
                </span>
                <span className="font-semibold text-slate-700">
                  {subDef.name[interfaceLanguage]}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 font-medium">
                  {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
                </span>
              </div>

              <h2
                id="configure-chapter-modal-title"
                className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2"
              >
                <BookCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>{t(interfaceLanguage, 'configureModalTitle')}</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t(interfaceLanguage, 'configureModalSub')}
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

          {/* Chapter Options List */}
          <div
            className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[200px] max-h-[52vh]"
            role="radiogroup"
            aria-label={t(interfaceLanguage, 'selectTopicPrompt')}
          >
            {/* 1. All Chapters option */}
            {(() => {
              const isAllSelected =
                tempSelected === 'All Verified Chapters' ||
                !tempSelected ||
                tempSelected.toLowerCase().includes('all verified') ||
                tempSelected.toLowerCase().includes('all chapters');
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={isAllSelected}
                  onClick={() => setTempSelected('All Verified Chapters')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isAllSelected
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">
                      {allChaptersLabel}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Practice across all {chapters.length} verified chapters of this curriculum
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

            {/* Verified Chapters List */}
            {chapters.map((ch: CurriculumChapter) => {
              const isSelected =
                tempSelected === ch.title.en ||
                tempSelected === ch.title.bn ||
                tempSelected === ch.title.hi ||
                tempSelected === ch.id;
              const displayName = getChapterDisplayName(ch, subjectId);
              return (
                <button
                  key={ch.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setTempSelected(ch.title.en)}
                  className={`w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900 shadow-xs'
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

          {/* Footer: Cancel and Save Selection */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer transition-colors"
            >
              {t(interfaceLanguage, 'langModalCancelBtn')}
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{t(interfaceLanguage, 'saveSelectionBtn')}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
