/**
 * Phase 0 TDD Specification: Dirty Dozen Security Rule Verification
 * Verifies that all 12 adversarial payloads specified in security_spec.md
 * are rejected with PERMISSION_DENIED by firestore.rules.
 */

export interface DirtyDozenScenario {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedOutcome: 'PERMISSION_DENIED';
  rationale: string;
}

export const DIRTY_DOZEN_SCENARIOS: DirtyDozenScenario[] = [
  {
    id: 1,
    name: 'Unverified Email Spoof',
    collection: '/users/user_1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isSignedIn() requires request.auth.token.email_verified == true'
  },
  {
    id: 2,
    name: 'Cross-User Profile Read',
    collection: '/users/user_2',
    operation: 'get',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'allow get requires request.auth.uid == userId'
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Profile',
    collection: '/users/user_1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isValidUserProfile enforces data.keys().hasOnly(...)'
  },
  {
    id: 4,
    name: 'Invalid Class Enum (Class 12)',
    collection: '/users/user_1',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isValidClassLevel enforces cls >= 5 && cls <= 10'
  },
  {
    id: 5,
    name: 'Orphaned Quiz Attempt Creation',
    collection: '/quizAttempts/attempt_1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'Requires exists(/databases/$(database)/documents/users/$(request.auth.uid))'
  },
  {
    id: 6,
    name: 'Cross-User Quiz Attempt Spoofing',
    collection: '/quizAttempts/attempt_1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isValidQuizAttempt enforces data.userId == request.auth.uid'
  },
  {
    id: 7,
    name: 'Terminal State Reversal / Score Tampering',
    collection: '/quizAttempts/attempt_1',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'allow update enforces existing().status != "completed"'
  },
  {
    id: 8,
    name: 'Client Timestamp Forgery',
    collection: '/quizAttempts/attempt_1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'Enforces incoming().createdAt == request.time'
  },
  {
    id: 9,
    name: 'ID Poisoning Attack',
    collection: '/studyNotes/bad$id',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isValidId enforces ^[a-zA-Z0-9_\\-]+$ and size <= 128'
  },
  {
    id: 10,
    name: 'Denial-of-Wallet Oversized String',
    collection: '/studyNotes/note_1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isValidStudyNote enforces data.sourceText.size() <= 20000'
  },
  {
    id: 11,
    name: 'Unauthorized List Scraping',
    collection: '/quizAttempts',
    operation: 'list',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'allow list enforces existing().userId == request.auth.uid'
  },
  {
    id: 12,
    name: 'Immutable Field Mutation',
    collection: '/quizAttempts/attempt_1',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'affectedKeys().hasOnly(...) blocks mutations to subject, mode, or createdAt'
  }
];
