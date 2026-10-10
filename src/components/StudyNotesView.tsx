import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  Layers,
  Play,
  BookmarkCheck,
  Trash2,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import {
  ClassLevel,
  LanguageCode,
  SavedStudyNote,
  StudyNoteAnalysis,
  SubjectId,
} from '../types';
import { t, LANGUAGE_LABELS } from '../i18n/translations';
import { CLASS_LEVELS, SUBJECT_LIST, getSubjectDefinition } from '../data/curriculum';
import { safeFetchJson, validateStudyNotesPayload } from '../utils/apiClient';

interface StudyNotesViewProps {
  interfaceLanguage: LanguageCode;
  defaultClass: ClassLevel;
  defaultQuizLanguage: LanguageCode;
  userId: string;
  savedNotes: SavedStudyNote[];
  onSaveNote: (note: SavedStudyNote) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onLaunchQuizFromNoteMcqs: (
    mcqs: StudyNoteAnalysis['mcqs'],
    classLevel: ClassLevel,
    subject: SubjectId,
    quizLanguage: LanguageCode,
    topic: string
  ) => Promise<void>;
}

const SAMPLE_PASSAGES: Record<LanguageCode, { title: string; subject: SubjectId; text: string }> = {
  en: {
    title: 'Photosynthesis & Cellular Energy in Green Plants',
    subject: 'life_science',
    text: `Photosynthesis is the biochemical process by which autotrophic green plants, algae, and certain bacteria convert solar light energy into chemical energy stored in glucose molecules. It occurs within chloroplasts, where chlorophyll pigments absorb light primarily in the blue and red wavelengths.
The process consists of two main stages:
1. Light-Dependent Reactions (in the thylakoid membranes): Light energy splits water molecules (photolysis of H2O), releasing oxygen gas (O2) as a byproduct and generating ATP and NADPH.
2. Light-Independent Reactions / Calvin Cycle (in the stroma): Using ATP and NADPH, carbon dioxide (CO2) is fixed into glucose (C6H12O6) via the enzyme RuBisCO.`,
  },
  bn: {
    title: 'সালোকসংশ্লেষ ও উদ্ভিদের খাদ্য প্রস্তুত প্রক্রিয়া',
    subject: 'life_science',
    text: `সালোকসংশ্লেষ (Photosynthesis) হলো একটি শারীরবৃত্তীয় জৈব-রাসায়নিক প্রক্রিয়া যার মাধ্যমে সবুজ উদ্ভিদ সূর্যালোকের উপস্থিতিতে এবং ক্লোরোফিলের সাহায্যে মূল দ্বারা শোষিত জল ও বায়ুমণ্ডলের কার্বন ডাইঅক্সাইডের রাসায়নিক বিক্রিয়ায় শর্করা জাতীয় খাদ্য (গ্লুকোজ) প্রস্তুত করে এবং উপজাত পদার্থ হিসেবে অক্সিজেন নির্গত করে।
সালোকসংশ্লেষের দুটি প্রধান দশা রয়েছে:
১. আলোক-নির্ভর দশা (গ্রানা অঞ্চলে): সূর্যালোকের প্রভাবে জলের ফটোলাইসিস ঘটে অক্সিজেন নির্গত হয় এবং ATP ও NADPH উৎপন্ন হয়।
২. আলোক-নিরপেক্ষ দশা বা কেলভিন চক্র (স্ট্রোমা অঞ্চলে): কার্বন ডাইঅক্সাইডের বিজারণ ঘটে গ্লুকোজ সংশ্লেষিত হয়।`,
  },
  hi: {
    title: 'प्रकाश संश्लेषण और पादप कोशिका में ऊर्जा रूपांतरण',
    subject: 'life_science',
    text: `प्रकाश संश्लेषण (Photosynthesis) वह जैव-रासायनिक प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश और क्लोरोफिल की उपस्थिति में जल (H2O) तथा कार्बन डाइऑक्साइड (CO2) से ग्लूकोज़ (C6H12O6) का निर्माण करते हैं और उप-उत्पाद के रूप में ऑक्सीजन गैस मुक्त करते हैं।
इसके दो मुख्य चरण हैं:
1. प्रकाश-रासायनिक अभिक्रिया (थायलाकोइड झिल्ली में): जल का प्रकाश-अपघटन (Photolysis) होता है, ऑक्सीजन मुक्त होती है तथा ATP और NADPH बनते हैं।
2. अप्रकाशिक अभिक्रिया या केल्विन चक्र (स्ट्रोमा में): CO2 का स्थिरीकरण होकर शर्करा (ग्लूकोज़) का निर्माण होता है।`,
  },
};

export const StudyNotesView: React.FC<StudyNotesViewProps> = ({
  interfaceLanguage,
  defaultClass,
  defaultQuizLanguage,
  userId,
  savedNotes,
  onSaveNote,
  onDeleteNote,
  onLaunchQuizFromNoteMcqs,
}) => {
  const [classLevel, setClassLevel] = useState<ClassLevel>(defaultClass);
  const [subject, setSubject] = useState<SubjectId>('life_science');
  // Independent Input and Output languages (Section 13)
  const [inputLanguage, setInputLanguage] = useState<LanguageCode>('en');
  const [outputLanguage, setOutputLanguage] = useState<LanguageCode>(defaultQuizLanguage);
  const [title, setTitle] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    name: string;
    mimeType: string;
    base64?: string;
  } | null>(null);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<StudyNoteAnalysis | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [savingNote, setSavingNote] = useState(false);
  const [launchingQuiz, setLaunchingQuiz] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLoadSample = (lang: LanguageCode) => {
    const sample = SAMPLE_PASSAGES[lang];
    setInputLanguage(lang);
    setSubject(sample.subject);
    setTitle(sample.title);
    setSourceText(sample.text);
    setUploadedFileInfo(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, ''));
    }

    const isTextFile =
      file.type.startsWith('text/') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.json');

    if (isTextFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = String(reader.result || '');
        setSourceText(content.slice(0, 18000));
        setUploadedFileInfo({ name: file.name, mimeType: file.type || 'text/plain' });
      };
      reader.readAsText(file);
    } else {
      // PDF or Image multimodal upload
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = String(reader.result || '');
        const base64 = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
        setUploadedFileInfo({
          name: file.name,
          mimeType: file.type || 'application/pdf',
          base64,
        });
        if (!sourceText) {
          setSourceText(`[Uploaded Document: ${file.name}]`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessNotes = async () => {
    setError(null);
    if (sourceText.trim().length < 10 && !uploadedFileInfo?.base64) {
      setError('Please enter at least a paragraph of study notes or upload a document.');
      return;
    }

    setProcessing(true);
    setFlippedCards({});
    try {
      const rawData = await safeFetchJson('/api/notes/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Study Notes Revision',
          sourceText,
          fileData: uploadedFileInfo?.base64
            ? { mimeType: uploadedFileInfo.mimeType, base64: uploadedFileInfo.base64 }
            : undefined,
          classLevel,
          subject,
          inputLanguage,
          outputLanguage,
          userId,
        }),
      });
      const validated = validateStudyNotesPayload(rawData);
      setAnalysis(validated);
    } catch (err: any) {
      setError(err?.message || 'Error processing study notes.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveCurrentNote = async () => {
    if (!analysis) return;
    setSavingNote(true);
    try {
      const newNote: SavedStudyNote = {
        noteId: `note_${Date.now()}`,
        userId,
        title: analysis.title || title || 'Saved Study Note',
        classLevel,
        subject,
        inputLanguage,
        outputLanguage,
        sourceText: sourceText || title,
        analysis,
        createdAt: new Date().toISOString(),
      };
      await onSaveNote(newNote);
    } finally {
      setSavingNote(false);
    }
  };

  const handleLaunchQuiz = async () => {
    if (!analysis || !analysis.mcqs || analysis.mcqs.length === 0) return;
    setLaunchingQuiz(true);
    try {
      await onLaunchQuizFromNoteMcqs(
        analysis.mcqs,
        classLevel,
        subject,
        outputLanguage,
        analysis.title || title || 'Study Notes Quiz'
      );
    } finally {
      setLaunchingQuiz(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          {t(interfaceLanguage, 'studyNotesTitle')}
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl">
          {t(interfaceLanguage, 'studyNotesSub')}
        </p>
      </div>

      {/* Input & Independent Language Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          {/* Class, Subject, Independent Input & Output Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t(interfaceLanguage, 'classLabel')}
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(Number(e.target.value) as ClassLevel)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 cursor-pointer"
              >
                {CLASS_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t(interfaceLanguage, 'subjectLabel')}
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectId)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 cursor-pointer"
              >
                {SUBJECT_LIST.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name[interfaceLanguage]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t(interfaceLanguage, 'inputLangLabel')}
              </label>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['en', 'bn', 'hi'] as LanguageCode[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setInputLanguage(lang)}
                    className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      inputLanguage === lang
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t(interfaceLanguage, 'outputLangLabel')}
              </label>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['en', 'bn', 'hi'] as LanguageCode[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setOutputLanguage(lang)}
                    className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      outputLanguage === lang
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Note Quick Loaders */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Load sample textbook passage:</span>
            {(['en', 'bn', 'hi'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLoadSample(lang)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                Sample ({LANGUAGE_LABELS[lang]})
              </button>
            ))}
          </div>

          {/* Note Title & Content Input */}
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(interfaceLanguage, 'noteTitlePlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
            />

            <textarea
              rows={7}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={t(interfaceLanguage, 'noteTextPlaceholder')}
              className="w-full p-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Document Upload & Submit Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.json,.pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadedFileInfo
                  ? `Uploaded: ${uploadedFileInfo.name}`
                  : t(interfaceLanguage, 'uploadDocBtn')}
              </button>
            </div>

            <button
              type="button"
              disabled={processing}
              onClick={handleProcessNotes}
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
              {processing
                ? t(interfaceLanguage, 'processingNotesMsg')
                : t(interfaceLanguage, 'generateStudyToolsBtn')}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Saved Study Notes Library */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              {t(interfaceLanguage, 'savedNotesTitle')}
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {savedNotes.length}
            </span>
          </div>

          {savedNotes.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              {t(interfaceLanguage, 'noSavedNotes')}
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {savedNotes.map((item) => {
                const subDef = getSubjectDefinition(item.subject);
                return (
                  <div
                    key={item.noteId}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 space-y-2 edu-card-hover"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTitle(item.title);
                          setClassLevel(item.classLevel);
                          setSubject(item.subject);
                          setInputLanguage(item.inputLanguage);
                          setOutputLanguage(item.outputLanguage);
                          setSourceText(item.sourceText);
                          setAnalysis(item.analysis);
                        }}
                        className="text-left font-semibold text-sm text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {item.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(item.noteId)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer p-1"
                        title="Delete saved note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>Class {item.classLevel}</span>
                      <span>·</span>
                      <span>{subDef.name[interfaceLanguage]}</span>
                      <span>·</span>
                      <span>
                        {LANGUAGE_LABELS[item.inputLanguage]} →{' '}
                        {LANGUAGE_LABELS[item.outputLanguage]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton While Study Notes Are Being Analyzed */}
      <AnimatePresence>
        {processing && (
          <motion.div
            key="study-notes-skeleton"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
            aria-live="polite"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="space-y-2 w-1/2">
                <div className="h-3 w-32 rounded edu-skeleton" />
                <div className="h-6 w-3/4 rounded-md edu-skeleton" />
              </div>
              <div className="h-9 w-40 rounded-lg edu-skeleton" />
            </div>
            <div className="space-y-2.5">
              <div className="h-4 w-full rounded edu-skeleton" />
              <div className="h-4 w-11/12 rounded edu-skeleton" />
              <div className="h-4 w-4/5 rounded edu-skeleton" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="h-28 rounded-xl edu-skeleton" />
              <div className="h-28 rounded-xl edu-skeleton" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Output Workspace */}
      <AnimatePresence>
        {analysis && !processing && (
          <motion.div
            key={analysis.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Summary & Action Toolbar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xs text-slate-500">
                    Output Language: <strong>{LANGUAGE_LABELS[outputLanguage]}</strong>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {analysis.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={savingNote}
                    onClick={handleSaveCurrentNote}
                    className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                    {savingNote ? 'Saving...' : t(interfaceLanguage, 'saveNoteBtn')}
                  </button>

                  {analysis.mcqs && analysis.mcqs.length > 0 && (
                    <button
                      type="button"
                      disabled={launchingQuiz}
                      onClick={handleLaunchQuiz}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      {launchingQuiz
                        ? 'Starting Quiz...'
                        : t(interfaceLanguage, 'launchNoteQuizBtn')}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  {t(interfaceLanguage, 'summarySectionTitle')}
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {analysis.summary}
                </p>
              </div>
            </div>

            {/* Difficult Concepts Explained & Revision Flashcards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Concepts */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  {t(interfaceLanguage, 'conceptsSectionTitle')}
                </h3>
                <div className="divide-y divide-slate-200">
                  {analysis.keyConcepts.map((c, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="font-bold text-sm text-slate-900">{c.term}</div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {c.explanation}
                      </p>
                      {c.example && (
                        <p className="text-xs text-slate-500">
                          <strong>Example:</strong> {c.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Flip Flashcards */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-indigo-600" />
                  {t(interfaceLanguage, 'flashcardsSectionTitle')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysis.flashcards.map((card, idx) => {
                    const isFlipped = Boolean(flippedCards[idx]);
                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() =>
                          setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                        className={`p-4 rounded-xl border text-left transition-colors cursor-pointer min-h-32 flex flex-col justify-between ${
                          isFlipped
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-[11px] font-mono opacity-60">
                          {isFlipped ? `ANSWER #${idx + 1}` : `QUESTION #${idx + 1}`}
                        </div>
                        <p className="text-sm font-medium leading-snug my-2">
                          {isFlipped ? card.back : card.front}
                        </p>
                        <div className="text-[11px] underline opacity-75">
                          {isFlipped ? 'Click to view question' : 'Click to reveal answer'}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
