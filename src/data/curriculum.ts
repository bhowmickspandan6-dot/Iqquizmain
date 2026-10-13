import { ClassLevel, SubjectId } from '../types';
import {
  CurriculumChapter,
  ClassSubjectCurriculum,
  SubjectDefinition,
} from './curriculumTypes';
import { MATHEMATICS_SUBJECT } from './curriculumMath';
import {
  EVS_SUBJECT,
  SCIENCE_SUBJECT,
  PHYSICAL_SCIENCE_SUBJECT,
  LIFE_SCIENCE_SUBJECT,
} from './curriculumScience';
import {
  HISTORY_SUBJECT,
  GEOGRAPHY_SUBJECT,
  HISTORY_GEOGRAPHY_LEGACY_SUBJECT,
} from './curriculumSocial';
import {
  ENGLISH_SUBJECT,
  BANGLA_SUBJECT,
  HINDI_SUBJECT,
} from './curriculumLanguages';

export type {
  CurriculumChapter,
  ClassSubjectCurriculum,
  SubjectDefinition,
};

export const CLASS_LEVELS: ClassLevel[] = [5, 6, 7, 8, 9, 10];

// Complete list of WBBSE / WBBPE academic subjects across Classes 5–10
export const SUBJECT_LIST: SubjectDefinition[] = [
  MATHEMATICS_SUBJECT,
  SCIENCE_SUBJECT,
  PHYSICAL_SCIENCE_SUBJECT,
  LIFE_SCIENCE_SUBJECT,
  HISTORY_SUBJECT,
  GEOGRAPHY_SUBJECT,
  EVS_SUBJECT,
  ENGLISH_SUBJECT,
  BANGLA_SUBJECT,
  HINDI_SUBJECT,
];

const ALL_SUBJECTS_BY_ID: Record<SubjectId, SubjectDefinition> = {
  mathematics: MATHEMATICS_SUBJECT,
  science: SCIENCE_SUBJECT,
  physical_science: PHYSICAL_SCIENCE_SUBJECT,
  life_science: LIFE_SCIENCE_SUBJECT,
  history: HISTORY_SUBJECT,
  geography: GEOGRAPHY_SUBJECT,
  evs: EVS_SUBJECT,
  history_geography: HISTORY_GEOGRAPHY_LEGACY_SUBJECT,
  english: ENGLISH_SUBJECT,
  bangla: BANGLA_SUBJECT,
  hindi: HINDI_SUBJECT,
  hindi_subject: HINDI_SUBJECT,
  gk: {
    ...SCIENCE_SUBJECT,
    id: 'gk',
    name: {
      en: 'General Knowledge & Science',
      bn: 'সাধারণ জ্ঞান ও বিজ্ঞান',
      hi: 'सामान्य ज्ञान एवं विज्ञान',
    },
    shortDesc: {
      en: 'Interdisciplinary science and general awareness curriculum.',
      bn: 'বিজ্ঞান ও সাধারণ জ্ঞানের সমন্বিত পাঠ্যক্রম।',
      hi: 'विज्ञान और सामान्य जागरूकता का अंतःविषय पाठ्यक्रम।',
    },
  },
};

export function getSubjectDefinition(subjectId: SubjectId): SubjectDefinition {
  return ALL_SUBJECTS_BY_ID[subjectId] || MATHEMATICS_SUBJECT;
}

export const getClassCurriculum = getClassSubjectCurriculum;

export function getClassSubjectCurriculum(
  classLevel: ClassLevel,
  subjectId: SubjectId
): ClassSubjectCurriculum {
  const sub = getSubjectDefinition(subjectId);
  const curr =
    sub.curriculumByClass[classLevel] || sub.curriculumByClass[8];
  if (curr && curr.chapters.length > 0) {
    return curr;
  }
  // If `science` is requested in Class 9 or 10 where it splits into Physical & Life Science,
  // combine the verified Physical Science and Life Science chapters for that class
  if (subjectId === 'science' && (classLevel === 9 || classLevel === 10)) {
    const ps = PHYSICAL_SCIENCE_SUBJECT.curriculumByClass[classLevel];
    const ls = LIFE_SCIENCE_SUBJECT.curriculumByClass[classLevel];
    return {
      ...curr,
      chapters: [...ps.chapters, ...ls.chapters],
    };
  }
  return curr;
}

/**
 * Returns the subjects applicable to the given class level in the official WBBPE / WBBSE curriculum.
 * - Class 5: Mathematics (Amar Ganit), Environmental Studies (Amader Paribesh), English (Butterfly), Bangla (Patabahar), Hindi Track.
 * - Classes 6, 7, 8: Mathematics (Ganit Prabha), Environment & Science (Paribesh o Bigyan), History (Atit o Aitihya), Geography (Amader Prithibi), English (Blossoms), Bangla (Sahitya Mela), Hindi Track.
 * - Classes 9, 10: Mathematics (Ganit Prakash), Physical Science (Bhouto Bigyan o Paribesh), Life Science (Jiban Bigyan o Paribesh), History (Itihas o Paribesh), Geography (Bhugol o Paribesh), English (Bliss), Bangla (Sahitya Sanchayan), Hindi Track.
 */
export function getSubjectsForClass(
  classLevel: ClassLevel
): SubjectDefinition[] {
  const validClass: ClassLevel = CLASS_LEVELS.includes(classLevel)
    ? classLevel
    : 8;
  return SUBJECT_LIST.filter((sub) => {
    const curr = sub.curriculumByClass[validClass];
    return Boolean(curr && curr.applicableToClass && curr.chapters.length > 0);
  });
}

/**
 * Resolves either the single requested chapter or the complete pool of chapters for a (classLevel, subjectId, topicQuery).
 */
export function resolveCurriculumChaptersForQuiz(
  classLevel: ClassLevel,
  subjectId: SubjectId,
  topicQuery?: string
): {
  curriculum: ClassSubjectCurriculum;
  selectedChapters: CurriculumChapter[];
  isAllChapters: boolean;
} {
  const curriculum = getClassSubjectCurriculum(classLevel, subjectId);
  const allChapters = curriculum.chapters || [];
  const trimmed = (topicQuery || '').trim();

  if (
    !trimmed ||
    trimmed === 'All Verified Chapters' ||
    trimmed.toLowerCase().includes('all verified chapters') ||
    trimmed.toLowerCase().includes('all chapters')
  ) {
    return {
      curriculum,
      selectedChapters: allChapters,
      isAllChapters: true,
    };
  }

  const exactMatch = allChapters.find(
    (ch) =>
      ch.id === trimmed ||
      ch.title.en.toLowerCase() === trimmed.toLowerCase() ||
      ch.title.bn === trimmed ||
      ch.title.hi === trimmed
  );

  if (exactMatch) {
    return {
      curriculum,
      selectedChapters: [exactMatch],
      isAllChapters: false,
    };
  }

  const partialMatch = allChapters.find(
    (ch) =>
      ch.title.en.toLowerCase().includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(ch.title.en.toLowerCase()) ||
      ch.topics.some((t) => t.toLowerCase().includes(trimmed.toLowerCase()))
  );

  if (partialMatch) {
    return {
      curriculum,
      selectedChapters: [partialMatch],
      isAllChapters: false,
    };
  }

  return {
    curriculum,
    selectedChapters: allChapters,
    isAllChapters: true,
  };
}

/**
 * Formats a chapter title for user interface display:
 * - For Hindi subject ('hindi' or 'hindi_subject'), displays Hindi (hi) chapter title.
 * - For all other subjects across all classes (5–10), displays Bengali (bn) chapter title.
 */
export function getChapterDisplayName(
  chapter: CurriculumChapter,
  subjectId?: SubjectId
): string {
  if (subjectId === 'hindi' || subjectId === 'hindi_subject') {
    return chapter.title.hi || chapter.title.bn || chapter.title.en;
  }
  return chapter.title.bn || chapter.title.en;
}

/**
 * Formats a topic/chapter string for user display.
 * If the topic represents a specific chapter from curriculum, it displays in Bengali (or Hindi for Hindi subject).
 */
export function formatTopicForDisplay(
  topic: string,
  subjectId?: SubjectId,
  classLevel?: ClassLevel
): string {
  const trimmed = (topic || '').trim();
  if (
    !trimmed ||
    trimmed === 'All Verified Chapters' ||
    trimmed.toLowerCase().includes('all verified') ||
    trimmed.toLowerCase().includes('all chapters')
  ) {
    if (subjectId === 'hindi' || subjectId === 'hindi_subject') {
      return 'सभी सत्यापित अध्याय (All Verified Chapters)';
    }
    return 'সকল যাচাইকৃত অধ্যায় (All Verified Chapters)';
  }

  if (subjectId && classLevel) {
    const curr = getClassSubjectCurriculum(classLevel, subjectId);
    const matched = curr.chapters.find(
      (c) =>
        c.title.en.toLowerCase() === trimmed.toLowerCase() ||
        c.id === trimmed ||
        c.title.bn === trimmed ||
        c.title.hi === trimmed
    );
    if (matched) {
      return getChapterDisplayName(matched, subjectId);
    }
  }

  return trimmed;
}

