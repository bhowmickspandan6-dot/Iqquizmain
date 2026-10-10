# EduQuiz AI — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Default-Deny Catch-All**: Any path not explicitly matched (`/users/{userId}`, `/quizAttempts/{attemptId}`, `/studyNotes/{noteId}`) is unconditionally denied for all reads and writes.
2. **Identity & Verification Integrity**:
   - All reads and writes require `request.auth != null` and `request.auth.token.email_verified == true`.
   - Every document in `/users/{userId}` must have `uid == userId && uid == request.auth.uid`.
   - Every document in `/quizAttempts/{attemptId}` and `/studyNotes/{noteId}` must have `userId == request.auth.uid` and require `exists(/databases/$(database)/documents/users/$(request.auth.uid))` on creation.
3. **PII & Cross-Student Isolation**:
   - No student can read (`get` or `list`) or modify another student's profile, quiz attempts, locked answers, or study notes.
   - `allow list` on `/quizAttempts` and `/studyNotes` strictly enforces `resource.data.userId == request.auth.uid`.
4. **Strict Schema, Key Allowlisting & Volumetric Bounds**:
   - All `create` and `update` operations validate exact required and allowed keys via `hasAll` and `hasOnly`.
   - Every string field enforces `.size()` bounds and regex patterns where applicable (`isValidId`).
5. **Terminal State Locking & Immutable Fields**:
   - Once a `QuizAttempt` reaches `existing().status == 'completed'`, no further updates are permitted under any circumstances (`existing().status != 'completed'`).
   - `createdAt`, `uid`, `userId`, `attemptId`, `noteId`, `classLevel`, `subject`, `quizLanguage`, and `mode` are immutable after creation.
   - Timestamp integrity is strictly enforced: `incoming().createdAt == request.time` on create and `incoming().updatedAt == request.time` on update.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Unverified Email Spoof)**: Authenticated user with `email_verified: false` attempting to create `/users/{uid}`. -> `PERMISSION_DENIED`
2. **Payload 2 (Cross-User Profile Read)**: User A attempting `get` on `/users/userB`. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow Field Injection on Profile)**: Creating `/users/{uid}` with extra field `isAdmin: true`. -> `PERMISSION_DENIED`
4. **Payload 4 (Invalid Class Enum)**: Updating `/users/{uid}` with `selectedClass: 12` (outside `5..10`). -> `PERMISSION_DENIED`
5. **Payload 5 (Orphaned Quiz Attempt Creation)**: Creating `/quizAttempts/{attemptId}` when `/users/{uid}` does not exist. -> `PERMISSION_DENIED`
6. **Payload 6 (Cross-User Quiz Attempt Spoofing)**: User A creating `/quizAttempts/{attemptId}` with `userId: "userB"`. -> `PERMISSION_DENIED`
7. **Payload 7 (Terminal State Reversal / Score Tampering)**: Updating a `QuizAttempt` whose `existing().status == 'completed'` to alter `correctCount` or `scorePercentage`. -> `PERMISSION_DENIED`
8. **Payload 8 (Client Timestamp Forgery)**: Creating `/quizAttempts/{attemptId}` with a past or future `createdAt` != `request.time`. -> `PERMISSION_DENIED`
9. **Payload 9 (ID Poisoning Attack)**: Creating `/studyNotes/{noteId}` with a 200-character ID containing special characters (`$`, `/`). -> `PERMISSION_DENIED`
10. **Payload 10 (Denial-of-Wallet Oversized String)**: Creating `/studyNotes/{noteId}` with a 100KB `sourceText` (> 20000 chars). -> `PERMISSION_DENIED`
11. **Payload 11 (Unauthorized List Scraping)**: Listing `/quizAttempts` without filtering `userId == request.auth.uid`. -> `PERMISSION_DENIED`
12. **Payload 12 (Immutable Field Mutation)**: Updating `createdAt` or `subject` on an in-progress `/quizAttempts/{attemptId}`. -> `PERMISSION_DENIED`
