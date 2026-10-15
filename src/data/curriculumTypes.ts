import type {
  ClassLevel,
  CurriculumVerificationStatus,
  LanguageCode,
  SubjectId,
} from '../types.ts';

export interface CurriculumChapter {
  id: string;
  chapterNumber: number;
  title: Record<LanguageCode, string>;
  keyConcepts: string[];
  topics: string[];
  textbookName: Record<LanguageCode, string>;
  verificationStatus: CurriculumVerificationStatus;
}

export interface ClassSubjectCurriculum {
  status:
    | 'prescribed'
    | 'integrated_evs'
    | 'language_elective'
    | 'additional_practice';
  verificationStatus: CurriculumVerificationStatus;
  applicableToClass: boolean;
  textbookName: Record<LanguageCode, string>;
  syllabusVersion: string;
  officialSource: string;
  boardNote: Record<LanguageCode, string>;
  chapters: CurriculumChapter[];
}

export interface SubjectDefinition {
  id: SubjectId;
  name: Record<LanguageCode, string>;
  shortDesc: Record<LanguageCode, string>;
  domainGuardKeywords: string[];
  curriculumByClass: Record<ClassLevel, ClassSubjectCurriculum>;
}

export function ch(
  id: string,
  chapterNumber: number,
  en: string,
  bn: string,
  hi: string,
  topics: string[],
  textbookName: Record<LanguageCode, string>,
  verificationStatus: CurriculumVerificationStatus = 'verified'
): CurriculumChapter {
  return {
    id,
    chapterNumber,
    title: { en, bn, hi },
    keyConcepts: topics,
    topics,
    textbookName,
    verificationStatus,
  };
}
