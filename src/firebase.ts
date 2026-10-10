import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  ClassLevel,
  LanguageCode,
  QuestionHistoryRecord,
  QuizAttemptState,
  SavedStudyNote,
  SubjectId,
} from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot as required by firebase-integration-rpc skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Blueprint validation constants (matching firebase-blueprint.json & firestore.rules)
const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  return cleaned.length > 0 && ID_REGEX.test(cleaned) ? cleaned : 'id_' + Date.now();
}

function clampString(val: string, minLen: number, maxLen: number, fallback = 'N/A'): string {
  const trimmed = (val || '').trim();
  const base = trimmed.length >= minLen ? trimmed : fallback;
  return base.slice(0, maxLen);
}

export async function signInWithGoogle(): Promise<User | null> {
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { User };

export async function syncUserProfileToFirestore(
  user: User,
  prefs: {
    selectedClass: ClassLevel;
    interfaceLanguage: LanguageCode;
    quizLanguage: LanguageCode;
  }
): Promise<void> {
  if (!user.emailVerified) return;
  const uid = sanitizeId(user.uid);
  const path = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  try {
    const snap = await getDoc(userRef);
    const displayName = clampString(user.displayName || user.email || 'Student', 1, 100, 'Student');
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        displayName,
        selectedClass: prefs.selectedClass,
        interfaceLanguage: prefs.interfaceLanguage,
        quizLanguage: prefs.quizLanguage,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        displayName,
        selectedClass: prefs.selectedClass,
        interfaceLanguage: prefs.interfaceLanguage,
        quizLanguage: prefs.quizLanguage,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserProfileFromFirestore(user: User): Promise<{
  selectedClass: ClassLevel;
  interfaceLanguage: LanguageCode;
  quizLanguage: LanguageCode;
} | null> {
  if (!user.emailVerified) return null;
  const uid = sanitizeId(user.uid);
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      selectedClass: (data.selectedClass as ClassLevel) || 8,
      interfaceLanguage: (data.interfaceLanguage as LanguageCode) || 'en',
      quizLanguage: (data.quizLanguage as LanguageCode) || 'en',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveQuizAttemptToFirestore(
  user: User,
  attempt: QuizAttemptState
): Promise<void> {
  if (!user.emailVerified) return;
  const uid = sanitizeId(user.uid);
  const attemptId = sanitizeId(attempt.attemptId);
  const path = `quizAttempts/${attemptId}`;
  const ref = doc(db, 'quizAttempts', attemptId);

  const totalQuestions = Math.max(1, Math.min(50, attempt.questions.length));
  const lockedList = Object.values(attempt.lockedAnswers);
  const correctCount =
    attempt.scoreSummary?.correctCount ??
    lockedList.filter((a) => a.isCorrect === true).length;
  const incorrectCount =
    attempt.scoreSummary?.incorrectCount ??
    lockedList.filter((a) => a.isCorrect === false).length;
  const unansweredCount =
    attempt.scoreSummary?.unansweredCount ??
    Math.max(0, totalQuestions - correctCount - incorrectCount);
  const scorePercentage =
    attempt.scoreSummary?.percentage ??
    Math.round((correctCount / totalQuestions) * 100);

  try {
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        attemptId,
        userId: uid,
        classLevel: attempt.config.classLevel,
        subject: attempt.config.subject,
        quizLanguage: attempt.config.quizLanguage,
        topic: clampString(attempt.config.topic, 1, 160, 'General'),
        difficulty: attempt.config.difficulty,
        mode: attempt.config.mode,
        totalQuestions,
        correctCount,
        incorrectCount,
        unansweredCount,
        scorePercentage: Math.max(0, Math.min(100, scorePercentage)),
        timeTakenSeconds: Math.max(0, Math.min(86400, Math.round(attempt.timeTakenSeconds || 0))),
        status: attempt.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (existingSnap.data().status !== 'completed') {
      await updateDoc(ref, {
        correctCount,
        incorrectCount,
        unansweredCount,
        scorePercentage: Math.max(0, Math.min(100, scorePercentage)),
        timeTakenSeconds: Math.max(0, Math.min(86400, Math.round(attempt.timeTakenSeconds || 0))),
        status: attempt.status,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveStudyNoteToFirestore(
  user: User,
  note: SavedStudyNote
): Promise<void> {
  if (!user.emailVerified) return;
  const uid = sanitizeId(user.uid);
  const noteId = sanitizeId(note.noteId);
  const path = `studyNotes/${noteId}`;
  const ref = doc(db, 'studyNotes', noteId);

  const conceptsFormatted = note.analysis.keyConcepts
    .map((c) => `• ${c.term}: ${c.explanation} (${c.example})`)
    .join('\n');
  const flashcardsFormatted = note.analysis.flashcards
    .map((f, i) => `Q${i + 1}: ${f.front}\nA${i + 1}: ${f.back}`)
    .join('\n\n');
  const revisionGuide = clampString(
    `${conceptsFormatted}\n\n---\n\n${flashcardsFormatted}`,
    1,
    25000,
    'Revision guide'
  );

  try {
    await setDoc(ref, {
      noteId,
      userId: uid,
      title: clampString(note.title, 1, 200, 'Study Note'),
      classLevel: note.classLevel,
      subject: note.subject,
      inputLanguage: note.inputLanguage,
      outputLanguage: note.outputLanguage,
      sourceText: clampString(note.sourceText, 1, 20000, 'Study content'),
      summary: clampString(note.analysis.summary, 1, 15000, 'Summary'),
      revisionGuide,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteStudyNoteFromFirestore(
  user: User,
  noteId: string
): Promise<void> {
  if (!user.emailVerified) return;
  const cleanId = sanitizeId(noteId);
  const path = `studyNotes/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'studyNotes', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function listUserQuizAttemptsFromFirestore(user: User): Promise<any[]> {
  if (!user.emailVerified) return [];
  const uid = sanitizeId(user.uid);
  const path = 'quizAttempts';
  try {
    const q = query(collection(db, 'quizAttempts'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveQuestionHistoryBatchToFirestore(
  user: User,
  records: QuestionHistoryRecord[]
): Promise<void> {
  if (!user.emailVerified || !Array.isArray(records) || records.length === 0) return;
  const uid = sanitizeId(user.uid);

  for (const rec of records) {
    const historyId = sanitizeId(`${uid}_${rec.fingerprint}`);
    const path = `questionHistory/${historyId}`;
    const ref = doc(db, 'questionHistory', historyId);
    try {
      const existingSnap = await getDoc(ref);
      if (!existingSnap.exists()) {
        await setDoc(ref, {
          historyId,
          userId: uid,
          classLevel: rec.classLevel,
          subject: rec.subject,
          topic: clampString(rec.topic, 1, 160, 'General'),
          difficulty:
            rec.difficulty === 'easy' ||
            rec.difficulty === 'medium' ||
            rec.difficulty === 'hard' ||
            rec.difficulty === 'mixed'
              ? rec.difficulty
              : 'mixed',
          language: rec.language,
          fingerprint: clampString(rec.fingerprint, 6, 64, 'fp_default'),
          structuralHash: clampString(
            rec.structuralHash || rec.fingerprint,
            6,
            64,
            'sh_default'
          ),
          conceptKey: clampString(rec.conceptKey, 2, 120, 'concept_general'),
          questionText: clampString(rec.questionText, 3, 2000, 'Question text'),
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      // Log and continue so one record error does not block the quiz flow
      console.warn('Could not persist question history item:', path, error);
    }
  }
}

export async function loadUserQuestionHistoryFromFirestore(
  user: User
): Promise<QuestionHistoryRecord[]> {
  if (!user.emailVerified) return [];
  const uid = sanitizeId(user.uid);
  const path = 'questionHistory';
  try {
    const q = query(collection(db, 'questionHistory'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        historyId: String(data.historyId || d.id),
        userId: String(data.userId || uid),
        classLevel: (Number(data.classLevel) as ClassLevel) || 8,
        subject: (data.subject as SubjectId) || 'mathematics',
        topic: String(data.topic || 'General'),
        difficulty: String(data.difficulty || 'mixed'),
        language: (data.language as LanguageCode) || 'en',
        fingerprint: String(data.fingerprint || ''),
        structuralHash: String(data.structuralHash || data.fingerprint || ''),
        conceptKey: String(data.conceptKey || ''),
        questionText: String(data.questionText || ''),
        createdAt: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.warn('Could not load question history from Firestore:', path, error);
    return [];
  }
}

export async function clearUserQuestionHistoryFromFirestore(user: User): Promise<void> {
  if (!user.emailVerified) return;
  const uid = sanitizeId(user.uid);
  try {
    const q = query(collection(db, 'questionHistory'), where('userId', '==', uid));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'questionHistory', d.id));
    }
  } catch (error) {
    console.warn('Could not clear question history from Firestore:', error);
  }
}

