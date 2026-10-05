# AP CSA curriculum and app update

The course follows all 53 topics in College Board's four-unit framework effective fall 2025, which College Board lists for the 2026–27 school year. Unit topic counts are 15, 12, 9, and 17. Sources checked October 3, 2026:

- [Current course](https://apcentral.collegeboard.org/courses/ap-computer-science-a)
- [Course and Exam Description](https://apcentral.collegeboard.org/media/pdf/ap-computer-science-a-course-and-exam-description.pdf)
- [CED clarifications](https://apcentral.collegeboard.org/media/pdf/ap-computer-science-a-course-and-exam-description-clarification.pdf)
- [Which CED to use in 2026–27](https://apcentral.collegeboard.org/courses/how-ap-develops-courses-and-exams/course-changes-overview)

## Lessons and numbering

All 30 inherited active lessons have been replaced with original learning goals, explanations, worked examples, traces, common mistakes, and practice. Their 480 questions have also been replaced. The 23 lessons added in the earlier pass were retained. The Android follow-up corrected sequencing in their examples: object-reference passing now uses Counter objects rather than arrays, the introductory data-set example uses ordinary variables, and the design-impact example uses if/else. Lesson 33 has a revised 16-question bank with content version 3. There are 848 lesson-practice questions in total, with 16 per lesson and four distinct questions randomly selected for each attempt. Separate attempts may repeat questions.

The active sequence, IDs, and filenames now run consecutively from 1 through 53 in curriculum order: `lesson1.json`–`lesson53.json` and `question1.json`–`question53.json`. Lesson numbers are separate from AP topic numbers, such as lesson 16 / topic 2.1. `assets/Curriculum/units.json` is the canonical mapping. Inactive legacy assets, the old diagnostic, and blank placeholders have been removed. Maintained project JSON files are checked for nonblank, valid JSON.

All app routes and assets use the consecutive IDs. The explicit `storageKey` mapping retains historical Firestore keys so renumbering cannot attach one lesson's bookmarks, schedule, review queue, or scores to another lesson. Do not remove this mapping or interpret a stored legacy ID as a current route ID. Old scores for rewritten banks remain historical and do not count as current mastery. Scores for unchanged content still count. Retired bookmarks show a replacement notice. No cloud records were migrated or deleted during this development work.

Content is original app practice, not official College Board questions. The topic map does not constitute College Board endorsement. Hands-on Java programming and free-response practice remain necessary beyond these short quizzes.

## Approved features and diagnostic

- A missed-question review queue, topic mastery checklist, and editable study plan with preferred weekdays and a daily lesson limit.
- Lesson search by topic, title, or keyword; a Java quick-reference screen with original examples; and private question issue reports saved on this device per account, accessible from Profile. Reports are not sent or synced.
- A dedicated diagnostic pool covering all 53 topics, offered only from initial Calendar setup. Each session selects 30 questions: 6 / 9 / 4 / 11 across Units 1–4. Saved results prioritize units by accuracy (weakest first), retaining all 53 lessons and the lesson sequence within each unit. The intro explains the scope; questions support back/next navigation, scrolling, progress, and elapsed time. Results show unit breakdowns, chosen/correct answers, explanations, and links to the relevant lessons.
- Diagnostic results do not award lesson mastery or predict an AP score. Unsaved quiz/diagnostic navigation warns before abandoning answers. Submission failures retain the frozen attempt for a consistent retry.

## UI and reliability fixes

Inline Java terms use wrapping native rounded pill containers aligned on the text baseline. Ordinary English “this” is no longer highlighted; explicit keyword mentions use backticks. Longer examples use rounded, horizontally scrollable code panels. Search and unit lists identify lessons with their consecutive numbers. Topics can be opened consistently through units, search, checklist, and calendar; Home still recommends the next unfinished lesson.

Calendar scheduling uses local dates, validates saved plans, respects capacity, and preserves overdue work until replanning. Replacing a plan avoids conflicting delete/set operations on the same document. Home, bookmarks, and progress views refresh current-content scores and show loading/error states. Bookmark edits update individual fields to avoid overwriting other saved questions.

Quiz transactions and attempt IDs prevent partial result saves and duplicate counting on retries. Best scores survive lower retakes within the same content version. New aggregate statistics avoid continually growing the old allScores profile array; the historical array is preserved. Private-report writes are serialized and isolated by account.

Notification preference changes now reschedule reminders with the installed Expo daily-trigger API, separate Android delivery channels, stable notification identifiers, error handling, and a save lock. Notification controls scroll on small screens. These are device-local reminders, not server pushes.

Account deletion now calls modular Firebase `deleteUser` while authenticated, checks recent sign-in before deleting study records, clears private reports on this device, includes the app's current subcollections, and reports failures instead of silently swallowing them. This remains a multi-step client operation, not an atomic server-side deletion; partial failures require retry. Profile-icon saves report failures and avoid overlapping writes. No account deletion or notification scheduling was executed during development.

## Verification

`npm test`: 41 checks pass, covering curriculum/schema/imports, all maintained JSON, consecutive numbering, diagnostic selection/scoring, sampling, schedule/date/streak logic, content versions, historical-ID collisions, account isolation, private-report saves, and mocked quiz transactions. Previously added content was compared against the pre-rewrite backup, ignoring only changed lesson IDs. JavaScript was also scanned for unbound identifiers and `git diff --check` passes.

Production exports for iOS and Android were checked with `npx expo export --platform all --output-dir <temporary-directory>`. This validates bundling, not native behavior. The Android follow-up could not access the emulator UI because the Mac was locked. Pill appearance, large text, and live Firebase round trips still need a final on-device check. Notifications remain temporarily disabled. No web support is claimed.

The tests use mocked storage and Firestore, not the deployed backend. Existing/new per-user paths include `settings/studyPlan`, `reviewQueue`, `attempts`, and `diagnosticResults/latest`. Firestore rules must permit the owner to use these paths and transactions/batches. Rules are not present in this repository and were not deployed or changed.

## October 4 Android UI follow-up

Study tools moved off Home into a Study bottom tab; question reports moved to Profile. Calendar owns diagnostic onboarding and plan editing. Once a calendar exists, the diagnostic route redirects to Calendar; an already-saved diagnostic resumes setup without requiring a retake. Existing calendars remain intact.

A shared circular-back header replaces the native title bars on applicable stack screens. Quiz headers display the lesson name. Lesson and diagnostic quizzes share QuizLayout for the timer, progress bar, question card, choices, and bottom controls. Lesson quizzes retain one in-card bookmark, vertically centered with an 8-point gap and bounded by the answer-choice width.

Results actions sit outside the scrolling content in a full-width bottom panel with rounded top corners and safe-area padding. The ExplanationScreen content/layout is unchanged. Lesson cards now have visible rounded bottom corners; Java reference appears above learning goals, and lesson action buttons have padded, centered content. Gradient buttons have rounded containers. Progress uses a mastery ring, weekly bars, unit progress, colored statistics, and recent-attempt cards. Question reports use a purple gradient heading, privacy card, and colored selection states.
