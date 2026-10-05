import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { localDateKey, nextStreak } from './studyLogic';
import { getContentVersion, scoreForCurrentContent, storageKeyForLesson, lessonKey } from './content';
import { updateScore } from './dataStore';

// One transaction prevents partial saves; the attempt ID makes retries idempotent.
export async function saveQuizAttempt(user, lessonId, questions, answers, timeTaken, attemptId) {
  if (!user) throw new Error('Sign in again before saving your quiz.');
  const key = storageKeyForLesson(lessonId);
  const storedId = key?.replace('lesson', '');
  const score = questions.reduce((sum, q) => sum + (answers[q.id] === q.answer ? 1 : 0), 0);
  const today = localDateKey();
  const contentVersion = getContentVersion(lessonId);
  if (!contentVersion || questions.length !== 4 || questions.some(q => !Number.isInteger(answers[q.id]) || answers[q.id] < 0 || answers[q.id] >= q.options.length)) throw new Error('Complete all four questions before submitting.');
  const result = { lessonId: storedId, score, total: questions.length, timeTaken, contentVersion };
  const userRef = doc(db, 'users', user.uid);
  const scoreRef = doc(userRef, 'scores', key);
  const attemptRef = doc(userRef, 'attempts', attemptId);
  const saved = await runTransaction(db, async transaction => {
    const previousAttempt = await transaction.get(attemptRef);
    if (previousAttempt.exists()) return previousAttempt.data();
    const profile = await transaction.get(userRef);
    const previousScore = await transaction.get(scoreRef);
    const data = profile.data() || {};
    const old = previousScore.data() || {};
    const bestScore = Math.max(scoreForCurrentContent(lessonId, old) ?? 0, score);
    const entry = { lessonId: storedId, contentVersion, score, total: questions.length, timestamp: new Date() };
    const completedLessons = Array.isArray(data.completedLessons) ? [...data.completedLessons] : [];
    if (score === questions.length && !completedLessons.includes(String(storedId))) completedLessons.push(String(storedId));
    const legacy = (Array.isArray(data.allScores) ? data.allScores : []).filter(s => Number.isFinite(s.score) && Number.isFinite(s.total) && s.total > 0);
    const previousStats = data.scoreStats || { count: legacy.length, percentageSum: legacy.reduce((sum, s) => sum + s.score / s.total * 100, 0) };
    transaction.set(userRef, {
      last5Scores: [...(Array.isArray(data.last5Scores) ? data.last5Scores : []), entry].slice(-5),
      scoreStats: { count: previousStats.count + 1, percentageSum: previousStats.percentageSum + score / questions.length * 100 },
      completedLessons,
      streak: nextStreak(data, today),
      lastCompletedDate: today,
      weeklyActivity: { ...(data.weeklyActivity || {}), [today]: (data.weeklyActivity?.[today] || 0) + 1 },
    }, { merge: true });
    transaction.set(scoreRef, { ...result, bestScore, timestamp: serverTimestamp() });
    transaction.set(attemptRef, { ...result, questionIds: questions.map(q => q.id), answers, timestamp: serverTimestamp() });
    questions.forEach(q => {
      const reviewRef = doc(userRef, 'reviewQueue', `${key}_${q.id}`);
      if (answers[q.id] === q.answer) transaction.delete(reviewRef);
      else transaction.set(reviewRef, { lessonId: String(storedId), questionId: q.id, contentVersion, selectedAnswer: answers[q.id], updatedAt: serverTimestamp() });
    });
    return result;
  });
  updateScore(lessonKey(lessonId), saved.score);
  return { lessonId, score: saved.score, total: saved.total, timeTaken: saved.timeTaken };
}
